/**
 * Admin Routes
 * Admin panel operations
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

/**
 * @route GET /api/admin/stats
 * @desc Get platform statistics
 * @access Admin
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue,
      activeListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.listing.count({
        where: { status: 'PUBLISHED' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        activeListings,
      },
    });
  })
);

/**
 * @route GET /api/admin/users
 * @desc Get all users
 * @access Admin
 */
router.get(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        membershipTier: true,
        kycStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  })
);

/**
 * @route GET /api/admin/listings
 * @desc Get all listings
 * @access Admin
 */
router.get(
  '/listings',
  asyncHandler(async (req: Request, res: Response) => {
    const listings = await prisma.listing.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: listings,
    });
  })
);

/**
 * @route POST /api/admin/listings/:id/moderate
 * @desc Moderate listing (approve/reject)
 * @access Admin
 */
router.post(
  '/listings/:id/moderate',
  asyncHandler(async (req: Request, res: Response) => {
    const { action } = req.body; // 'approve' or 'reject'

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: action === 'approve' ? 'PUBLISHED' : 'ARCHIVED',
      },
    });

    res.json({
      success: true,
      message: `Listing ${action === 'approve' ? 'disetujui' : 'ditolak'}`,
      data: listing,
    });
  })
);

/**
 * @route GET /api/admin/bookings
 * @desc Get all bookings
 * @access Admin
 */
router.get(
  '/bookings',
  asyncHandler(async (req: Request, res: Response) => {
    const bookings = await prisma.booking.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: bookings,
    });
  })
);

export default router;
