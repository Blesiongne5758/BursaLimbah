/**
 * File Upload Routes
 * Pre-signed URL generation and file management
 */

import { Router, Request, Response } from 'express';
import { FileStorageService, FileCategory, BucketType, UploadMetadata } from '../services/fileStorage.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const uploadRequestSchema = z.object({
  category: z.enum(['listing', 'profile', 'kyc', 'chat', 'validation']),
  originalName: z.string().min(1),
  mimeType: z.string(),
  size: z.number().positive(),
});

const getFileUrlSchema = z.object({
  fileId: z.string().uuid(),
});

// ============================================
// PRE-SIGNED UPLOAD URL
// ============================================

/**
 * @route POST /api/upload/presign
 * @desc Generate pre-signed URL for direct upload to S3
 * @access Private
 */
router.post(
  '/presign',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = uploadRequestSchema.parse(req.body);

    // Determine bucket based on category
    const bucket: BucketType = 
      validatedData.category === 'kyc' || validatedData.category === 'chat' 
        ? 'private' 
        : 'public';

    const metadata: UploadMetadata = {
      userId: req.user!.id,
      category: validatedData.category,
      originalName: validatedData.originalName,
      mimeType: validatedData.mimeType,
      size: validatedData.size,
      bucket,
    };

    // Generate pre-signed URL
    const { url, key } = await FileStorageService.generatePreSignedUploadUrl(metadata);

    res.json({
      success: true,
      data: {
        uploadUrl: url,
        key,
        bucket,
        expiresIn: 3600, // 1 hour
      },
    });
  })
);

// ============================================
// CONFIRM UPLOAD
// ============================================

/**
 * @route POST /api/upload/confirm
 * @desc Confirm upload and create file record
 * @access Private
 */
router.post(
  '/confirm',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { key, bucket, originalName, mimeType, size, category } = req.body;

    // Determine URL based on bucket
    const url = bucket === 'public'
      ? `https://${process.env.AWS_PUBLIC_BUCKET}.s3.amazonaws.com/${key}`
      : null; // Private files don't have public URLs

    // Create file record
    const fileRecord = await FileStorageService.createFileRecord({
      userId: req.user!.id,
      category,
      bucket,
      key,
      originalName,
      mimeType,
      size,
      url: url || '',
    });

    res.json({
      success: true,
      data: fileRecord,
    });
  })
);

// ============================================
// GET FILE URL (PRIVATE FILES)
// ============================================

/**
 * @route POST /api/upload/url
 * @desc Generate pre-signed GET URL for private files
 * @access Private
 */
router.post(
  '/url',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = getFileUrlSchema.parse(req.body);

    // Get file record
    const fileRecord = await FileStorageService.getFileRecord(fileId);

    if (!fileRecord) {
      throw new Error('File tidak ditemukan');
    }

    // Verify access
    const hasAccess = await FileStorageService.verifyFileAccess(
      fileRecord.key,
      req.user!.id,
      fileRecord.category
    );

    if (!hasAccess) {
      throw new Error('Anda tidak memiliki akses ke file ini');
    }

    // Generate pre-signed GET URL (only for private files)
    if (fileRecord.bucket === 'private') {
      const url = await FileStorageService.generatePreSignedGetUrl(
        fileRecord.key,
        fileRecord.bucket,
        req.user!.id,
        3600 // 1 hour
      );

      res.json({
        success: true,
        data: {
          url,
          expiresIn: 3600,
        },
      });
    } else {
      // Public files have direct URLs
      res.json({
        success: true,
        data: {
          url: fileRecord.url,
          expiresIn: null,
        },
      });
    }
  })
);

// ============================================
// GET USER FILES
// ============================================

/**
 * @route GET /api/upload/files/:category
 * @desc Get user's files by category
 * @access Private
 */
router.get(
  '/files/:category',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const category = req.params.category as FileCategory;

    const files = await FileStorageService.getUserFiles(req.user!.id, category);

    res.json({
      success: true,
      data: files,
    });
  })
);

// ============================================
// DELETE FILE
// ============================================

/**
 * @route DELETE /api/upload/:fileId
 * @desc Delete file
 * @access Private
 */
router.delete(
  '/:fileId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    await FileStorageService.deleteFileRecord(fileId, req.user!.id);

    res.json({
      success: true,
      message: 'File berhasil dihapus',
    });
  })
);

// ============================================
// CLOUDINARY UPLOAD (FOR IMAGES)
// ============================================

/**
 * @route POST /api/upload/cloudinary
 * @desc Upload image to Cloudinary for optimization
 * @access Private
 */
router.post(
  '/cloudinary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileBuffer, folder, options } = req.body;

    // Convert base64 to buffer
    const buffer = Buffer.from(fileBuffer, 'base64');

    const result = await FileStorageService.uploadToCloudinary(buffer, folder, options);

    res.json({
      success: true,
      data: result,
    });
  })
);

export default router;
