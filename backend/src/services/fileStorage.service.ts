/**
 * File Storage Service
 * AWS S3 + Cloudinary integration with pre-signed URLs
 * 
 * Architecture:
 * - Public Bucket: Listing photos, profile pictures (CDN served)
 * - Private Bucket: KYC docs, chat attachments (pre-signed GET URLs)
 * - Cloudinary: Image optimization, WebP conversion, thumbnails
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import crypto from 'crypto';

// ============================================
// S3 CLIENT CONFIGURATION
// ============================================

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

// ============================================
// TYPES
// ============================================

export type BucketType = 'public' | 'private';
export type FileCategory = 'listing' | 'profile' | 'kyc' | 'chat' | 'validation';

export interface UploadMetadata {
  userId: string;
  category: FileCategory;
  originalName: string;
  mimeType: string;
  size: number;
  bucket: BucketType;
}

export interface FileRecord {
  id: string;
  userId: string;
  category: FileCategory;
  bucket: BucketType;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PreSignedUploadUrl {
  url: string;
  key: string;
  fields?: Record<string, string>;
}

// ============================================
// FILE VALIDATION
// ============================================

export const ALLOWED_MIME_TYPES = {
  listing: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  profile: ['image/jpeg', 'image/png', 'image/webp'],
  kyc: ['image/jpeg', 'image/png', 'application/pdf'],
  chat: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  validation: ['image/jpeg', 'image/png', 'image/webp'],
};

export const MAX_FILE_SIZES = {
  listing: 5 * 1024 * 1024, // 5MB
  profile: 2 * 1024 * 1024, // 2MB
  kyc: 10 * 1024 * 1024, // 10MB
  chat: 5 * 1024 * 1024, // 5MB
  validation: 10 * 1024 * 1024, // 10MB
};

export const MAX_FILES_PER_CATEGORY = {
  listing: 10,
  profile: 1,
  kyc: 5,
  chat: 20,
  validation: 10,
};

/**
 * Validate file metadata
 */
export function validateFileMetadata(metadata: UploadMetadata): void {
  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[metadata.category];
  if (!allowedTypes.includes(metadata.mimeType)) {
    throw new AppError(
      `Tipe file tidak diizinkan. Diperbolehkan: ${allowedTypes.join(', ')}`,
      400
    );
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[metadata.category];
  if (metadata.size > maxSize) {
    throw new AppError(
      `Ukuran file terlalu besar. Maksimal: ${maxSize / 1024 / 1024}MB`,
      400
    );
  }
}

/**
 * Validate file magic bytes (server-side validation)
 * Uses file-type library to check actual file content
 */
export async function validateMagicBytes(
  buffer: Buffer,
  expectedMimeType: string
): Promise<boolean> {
  try {
    // Dynamic import file-type
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      throw new AppError('Tidak dapat mendeteksi tipe file', 400);
    }

    // Verify MIME type matches
    if (detected.mime !== expectedMimeType) {
      throw new AppError(
        `Tipe file tidak sesuai. Diklaim: ${expectedMimeType}, Terdeteksi: ${detected.mime}`,
        400
      );
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Magic bytes validation error:', error);
    throw new AppError('Validasi file gagal', 400);
  }
}

// ============================================
// KEY GENERATION
// ============================================

/**
 * Generate unique file key for S3
 */
function generateFileKey(
  userId: string,
  category: FileCategory,
  originalName: string
): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop() || 'jpg';
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  return `${category}/${userId}/${timestamp}-${random}-${sanitizedName}.${extension}`;
}

// ============================================
// PRE-SIGNED URLS
// ============================================

/**
 * Generate pre-signed URL for direct upload to S3
 * Client uploads directly to S3, saving server bandwidth
 */
export async function generatePreSignedUploadUrl(
  metadata: UploadMetadata
): Promise<PreSignedUploadUrl> {
  // Validate metadata first
  validateFileMetadata(metadata);

  const key = generateFileKey(metadata.userId, metadata.category, metadata.originalName);
  const bucket = metadata.bucket === 'public' ? config.aws.publicBucket : config.aws.privateBucket;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: metadata.mimeType,
    ContentLength: metadata.size,
    // Security headers
    Metadata: {
      'x-amz-meta-user-id': metadata.userId,
      'x-amz-meta-category': metadata.category,
      'x-amz-meta-original-name': metadata.originalName,
    },
    // ACL for public bucket
    ...(metadata.bucket === 'public' && { ACL: 'public-read' }),
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  logger.info(`Pre-signed upload URL generated for user ${metadata.userId}, key: ${key}`);

  return { url, key };
}

/**
 * Generate pre-signed GET URL for private files
 * Only accessible after verifying ownership/transaction status
 */
export async function generatePreSignedGetUrl(
  key: string,
  bucket: BucketType,
  userId: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  if (bucket !== 'private') {
    throw new AppError('Pre-signed GET URLs hanya untuk private bucket', 400);
  }

  const command = new GetObjectCommand({
    Bucket: config.aws.privateBucket,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });

  logger.info(`Pre-signed GET URL generated for user ${userId}, key: ${key}, expires in ${expiresIn}s`);

  return url;
}

/**
 * Verify user has access to private file
 */
export async function verifyFileAccess(
  key: string,
  userId: string,
  category: FileCategory
): Promise<boolean> {
  // Import prisma dynamically to avoid circular deps
  const { prisma } = await import('../lib/prisma');

  // Check if file belongs to user
  const fileRecord = await prisma.fileRecord.findFirst({
    where: {
      key,
      OR: [
        { userId }, // User owns the file
        // For KYC docs, user can access their own
        // For validation photos, buyer can access after DP paid
        // For chat attachments, both participants can access
      ],
    },
  });

  if (!fileRecord) {
    return false;
  }

  // Additional checks based on category
  switch (category) {
    case 'kyc':
      // User can only access their own KYC docs
      return fileRecord.userId === userId;

    case 'validation':
      // Buyer can access after DP paid
      const booking = await prisma.booking.findFirst({
        where: {
          listingId: key.split('/')[1], // Extract listing ID from key
          buyerId: userId,
          escrowStatus: { in: ['HOLD', 'RELEASED'] },
        },
      });
      return !!booking;

    case 'chat':
      // Both participants can access
      const conversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            some: { userId },
          },
        },
      });
      return !!conversation;

    default:
      return fileRecord.userId === userId;
  }
}

// ============================================
// CLOUDINARY INTEGRATION
// ============================================

/**
 * Upload image to Cloudinary for optimization
 * Returns optimized URLs with transformations
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'low' | 'medium' | 'high';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): Promise<{
  publicId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl: string;
}> {
  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `bursalimbah/${folder}`,
        resource_type: 'image',
        transformation: [
          { quality: options.quality || 'auto' },
          { format: options.format || 'auto' },
          ...(options.width ? [{ width: options.width, crop: 'limit' }] : []),
          ...(options.height ? [{ height: options.height, crop: 'limit' }] : []),
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

  // Generate thumbnail
  const thumbnailResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `bursalimbah/${folder}/thumbnails`,
        resource_type: 'image',
        transformation: [
          { width: 200, height: 200, crop: 'fill' },
          { quality: 'auto' },
          { format: 'webp' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    secureUrl: result.secure_url,
    thumbnailUrl: thumbnailResult.secure_url,
  };
}

/**
 * Get Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      ...(transformations.width ? [{ width: transformations.width, crop: transformations.crop || 'limit' }] : []),
      ...(transformations.height ? [{ height: transformations.height, crop: transformations.crop || 'limit' }] : []),
      { quality: transformations.quality || 'auto' },
      { format: transformations.format || 'auto' },
    ],
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
  logger.info(`Deleted from Cloudinary: ${publicId}`);
}

// ============================================
// S3 OPERATIONS
// ============================================

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string, bucket: BucketType): Promise<void> {
  const bucketName = bucket === 'public' ? config.aws.publicBucket : config.aws.privateBucket;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );

  logger.info(`Deleted from S3: ${key} from ${bucket} bucket`);
}

/**
 * Check if file exists in S3
 */
export async function fileExistsInS3(key: string, bucket: BucketType): Promise<boolean> {
  try {
    const bucketName = bucket === 'public' ? config.aws.publicBucket : config.aws.privateBucket;

    await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// ============================================
// FILE RECORD MANAGEMENT
// ============================================

/**
 * Create file record in database
 */
export async function createFileRecord(
  metadata: UploadMetadata & { key: string; url: string; thumbnailUrl?: string; cloudinaryPublicId?: string }
): Promise<FileRecord> {
  const { prisma } = await import('../lib/prisma');

  const fileRecord = await prisma.fileRecord.create({
     {
      userId: metadata.userId,
      category: metadata.category,
      bucket: metadata.bucket,
      key: metadata.key,
      originalName: metadata.originalName,
      mimeType: metadata.mimeType,
      size: metadata.size,
      url: metadata.url,
      thumbnailUrl: metadata.thumbnailUrl,
      cloudinaryPublicId: metadata.cloudinaryPublicId,
    },
  });

  logger.info(`File record created: ${fileRecord.id} for user ${metadata.userId}`);

  return fileRecord;
}

/**
 * Get file record by ID
 */
export async function getFileRecord(fileId: string): Promise<FileRecord | null> {
  const { prisma } = await import('../lib/prisma');

  return await prisma.fileRecord.findUnique({
    where: { id: fileId },
  });
}

/**
 * Get user's files by category
 */
export async function getUserFiles(userId: string, category: FileCategory): Promise<FileRecord[]> {
  const { prisma } = await import('../lib/prisma');

  return await prisma.fileRecord.findMany({
    where: { userId, category },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Delete file record and associated file
 */
export async function deleteFileRecord(fileId: string, userId: string): Promise<void> {
  const { prisma } = await import('../lib/prisma');

  const fileRecord = await prisma.fileRecord.findUnique({
    where: { id: fileId },
  });

  if (!fileRecord) {
    throw new AppError('File tidak ditemukan', 404);
  }

  if (fileRecord.userId !== userId) {
    throw new AppError('Anda tidak memiliki akses ke file ini', 403);
  }

  // Delete from S3
  await deleteFromS3(fileRecord.key, fileRecord.bucket);

  // Delete from Cloudinary if exists
  if (fileRecord.cloudinaryPublicId) {
    await deleteFromCloudinary(fileRecord.cloudinaryPublicId);
  }

  // Delete record from database
  await prisma.fileRecord.delete({
    where: { id: fileId },
  });

  logger.info(`File record deleted: ${fileId} by user ${userId}`);
}

// ============================================
// EXPORTS
// ============================================

export const FileStorageService = {
  // Pre-signed URLs
  generatePreSignedUploadUrl,
  generatePreSignedGetUrl,
  verifyFileAccess,

  // Cloudinary
  uploadToCloudinary,
  getCloudinaryUrl,
  deleteFromCloudinary,

  // S3
  deleteFromS3,
  fileExistsInS3,

  // File records
  createFileRecord,
  getFileRecord,
  getUserFiles,
  deleteFileRecord,

  // Validation
  validateFileMetadata,
  validateMagicBytes,

  // Constants
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  MAX_FILES_PER_CATEGORY,
};

export default FileStorageService;
