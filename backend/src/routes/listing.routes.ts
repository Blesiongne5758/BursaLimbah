/**
 * Listing Routes
 * CRUD operations for waste listings
 */

import { Router, Request, Response } from 'express';
import { ListingService } from '../services/listing.service';
import { authenticate, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createListingSchema, updateListingSchema, paginationSchema, listingFilterSchema } from '../utils/validators';

const router = Router();

/**
 * @route GET /api/listings
 * @desc Get all listings with filters
 * @access Public
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const filters = listingFilterSchema.parse(req.query);
    const pagination = paginationSchema.parse(req.query);

    const result = await ListingService.getAllListings(filters, pagination);

    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination,
    });
  })
);

/**
 * @route GET /api/listings/:id
 * @desc Get listing by ID
 * @access Public
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const listing = await ListingService.getListingById(req.params.id, req.user?.id);

    res.json({
      success: true,
      data: listing,
    });
  })
);

/**
 * @route POST /api/listings
 * @desc Create new listing
 * @access Private
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createListingSchema.parse(req.body);

    const listing = await ListingService.createListing(validatedData, req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Listing berhasil dibuat',
      data: listing,
    });
  })
);

/**
 * @route PUT /api/listings/:id
 * @desc Update listing
 * @access Private
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateListingSchema.parse(req.body);

    const listing = await ListingService.updateListing(
      req.params.id,
      validatedData,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Listing berhasil diupdate',
      data: listing,
    });
  })
);

/**
 * @route DELETE /api/listings/:id
 * @desc Delete listing
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await ListingService.deleteListing(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Listing berhasil dihapus',
    });
  })
);

/**
 * @route GET /api/listings/my
 * @desc Get my listings
 * @access Private
 */
router.get(
  '/my/listings',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const pagination = paginationSchema.parse(req.query);

    const result = await ListingService.getMyListings(req.user!.id, pagination);

    res.json({
      success: true,
      data: result.listings,
      pagination: result.pagination,
    });
  })
);

/**
 * @route POST /api/listings/:id/decrypt-location
 * @desc Decrypt listing location (requires booking + DP)
 * @access Private
 */
router.post(
  '/:id/decrypt-location',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const coords = await ListingService.decryptLocation(
      req.params.id,
      req.user!.id
    );

    res.json({
      success: true,
      data: coords,
    });
  })
);

export default router;
