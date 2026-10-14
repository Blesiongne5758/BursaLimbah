/**
 * KYC Routes
 * KYC/KYB verification operations
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route POST /api/kyc/ktp
 * @desc Submit KTP verification
 * @access Private
 */
router.post(
  '/ktp',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { nik, fullName, birthDate, photo } = req.body;

    // In production, integrate with real KTP verification service
    // For now, just update status
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { kycStatus: 'VERIFIED' },
    });

    res.json({
      success: true,
      message: 'KTP berhasil diverifikasi',
    });
  })
);

/**
 * @route POST /api/kyc/npwp
 * @desc Submit NPWP verification
 * @access Private
 */
router.post(
  '/npwp',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { npwp, companyName, document } = req.body;

    await prisma.companyInfo.upsert({
      where: { userId: req.user!.id },
      update: { npwp, companyName },
      create: {
        userId: req.user!.id,
        npwp,
        companyName,
      },
    });

    res.json({
      success: true,
      message: 'NPWP berhasil diverifikasi',
    });
  })
);

/**
 * @route POST /api/kyc/nib
 * @desc Submit NIB verification
 * @access Private
 */
router.post(
  '/nib',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { nib, businessField, document } = req.body;

    await prisma.companyInfo.upsert({
      where: { userId: req.user!.id },
      update: { nib },
      create: {
        userId: req.user!.id,
        nib,
        companyName: businessField,
      },
    });

    res.json({
      success: true,
      message: 'NIB berhasil diverifikasi',
    });
  })
);

/**
 * @route GET /api/kyc/status
 * @desc Get KYC status
 * @access Private
 */
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { companyInfo: true },
    });

    res.json({
      success: true,
      data: {
        kycStatus: user?.kycStatus,
        companyInfo: user?.companyInfo,
      },
    });
  })
);

export default router;
