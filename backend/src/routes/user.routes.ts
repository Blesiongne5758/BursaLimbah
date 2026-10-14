/**
 * User Routes
 * User management and profile operations
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        companyInfo: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: {
        ...user,
        passwordHash: undefined,
      },
    });
  })
);

/**
 * @route PUT /api/users/me
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, phone, city, province } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        phone,
        city,
        province,
      },
    });

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: user,
    });
  })
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID (public info only)
 * @access Public
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        city: true,
        province: true,
        membershipTier: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

export default router;
