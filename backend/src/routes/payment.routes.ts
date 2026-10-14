/**
 * Payment Routes
 * Payment processing and escrow management
 */

import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route POST /api/payments/create
 * @desc Create payment transaction
 * @access Private
 */
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    const payment = await PaymentService.createPayment(bookingId, req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil dibuat',
      data: payment,
    });
  })
);

/**
 * @route POST /api/payments/verify
 * @desc Verify payment status
 * @access Private
 */
router.post(
  '/verify',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { transactionId } = req.body;

    const result = await PaymentService.verifyPayment(transactionId);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * @route GET /api/payments/status/:bookingId
 * @desc Get payment status
 * @access Private
 */
router.get(
  '/status/:bookingId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const status = await PaymentService.getPaymentStatus(
      req.params.bookingId,
      req.user!.id
    );

    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * @route POST /api/payments/webhook
 * @desc Midtrans payment webhook
 * @access Public (secured by signature)
 */
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-midtrans-signature'] as string;

    await PaymentService.handleWebhook(req.body, signature);

    res.json({
      success: true,
      message: 'Webhook processed',
    });
  })
);

/**
 * @route POST /api/payments/release/:bookingId
 * @desc Release escrow funds to seller
 * @access Private (Admin only)
 */
router.post(
  '/release/:bookingId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await PaymentService.releaseEscrow(
      req.params.bookingId,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Dana berhasil dilepaskan',
      data: result,
    });
  })
);

/**
 * @route POST /api/payments/refund/:bookingId
 * @desc Refund payment to buyer
 * @access Private (Admin only)
 */
router.post(
  '/refund/:bookingId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;

    const result = await PaymentService.refundPayment(
      req.params.bookingId,
      req.user!.id,
      reason
    );

    res.json({
      success: true,
      message: 'Refund berhasil diproses',
      data: result,
    });
  })
);

export default router;
