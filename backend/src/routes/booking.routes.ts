/**
 * Booking Routes
 * Booking management and transaction handling
 */

import { Router, Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createBookingSchema } from '../utils/validators';

const router = Router();

/**
 * @route GET /api/bookings
 * @desc Get user bookings
 * @access Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const bookings = await BookingService.getUserBookings(req.user!.id);

    res.json({
      success: true,
      data: bookings,
    });
  })
);

/**
 * @route GET /api/bookings/:id
 * @desc Get booking by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const booking = await BookingService.getBookingById(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: booking,
    });
  })
);

/**
 * @route POST /api/bookings
 * @desc Create new booking
 * @access Private
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createBookingSchema.parse(req.body);

    const booking = await BookingService.createBooking(validatedData, req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking,
    });
  })
);

/**
 * @route PUT /api/bookings/:id/validate
 * @desc Validate booking (buyer confirms receipt)
 * @access Private
 */
router.put(
  '/:id/validate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { actualQuantity, finalPrice, conditionNotes, photos } = req.body;

    const booking = await BookingService.validateBooking(
      req.params.id,
      req.user!.id,
      { actualQuantity, finalPrice, conditionNotes, photos }
    );

    res.json({
      success: true,
      message: 'Booking berhasil divalidasi',
      data: booking,
    });
  })
);

/**
 * @route PUT /api/bookings/:id/cancel
 * @desc Cancel booking
 * @access Private
 */
router.put(
  '/:id/cancel',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;

    await BookingService.cancelBooking(req.params.id, req.user!.id, reason);

    res.json({
      success: true,
      message: 'Booking berhasil dibatalkan',
    });
  })
);

export default router;
