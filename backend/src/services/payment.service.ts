/**
 * Payment Service
 * Payment processing and escrow management
 */

import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';
import { config } from '../config';
import crypto from 'crypto';

// Mock Midtrans client (in production, use actual midtrans-client)
const midtransClient = {
  createTransaction: async (params: any) => {
    return {
      token: `SNAP_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${params.transaction_details.order_id}`,
    };
  },
};

export class PaymentService {
  /**
   * Create payment transaction
   */
  static async createPayment(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        buyer: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.buyerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke booking ini');
    }

    if (booking.escrowStatus !== 'PENDING') {
      throw new AppError('Pembayaran sudah diproses', 400);
    }

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: booking.downPayment,
      },
      customer_details: {
        first_name: booking.buyer.name,
        email: booking.buyer.email,
      },
    };

    const transaction = await midtransClient.createTransaction(parameter);

    // Update booking with transaction info
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        escrowStatus: 'PENDING',
      },
    });

    logger.info(`Payment created for booking: ${bookingId}`);

    return {
      bookingId: booking.id,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      amount: booking.downPayment,
      currency: 'IDR',
    };
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(transactionId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: transactionId },
    });

    if (!booking) {
      throw new NotFoundError('Transaksi tidak ditemukan');
    }

    // In production, check actual Midtrans status
    // For now, simulate successful payment
    await prisma.booking.update({
      where: { id: transactionId },
      data: {
        escrowStatus: 'HOLD',
        status: 'PAID_DP',
      },
    });

    logger.info(`Payment verified for booking: ${transactionId}`);

    return {
      status: 'success',
      bookingId: booking.id,
      amount: booking.downPayment,
    };
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.buyerId !== userId && booking.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke booking ini');
    }

    return {
      bookingId: booking.id,
      escrowStatus: booking.escrowStatus,
      status: booking.status,
      downPayment: booking.downPayment,
      totalPrice: booking.totalPrice,
    };
  }

  /**
   * Handle Midtrans webhook
   */
  static async handleWebhook(notification: any, signature: string) {
    // Verify signature (in production)
    // const expectedSignature = crypto.createHash('sha512')
    //   .update(notification.order_id + notification.status_code + notification.gross_amount + config.midtrans.serverKey)
    //   .digest('hex');
    // if (signature !== expectedSignature) {
    //   throw new AppError('Invalid signature', 401);
    // }

    const { order_id, transaction_status, fraud_status } = notification;

    const booking = await prisma.booking.findUnique({
      where: { id: order_id },
    });

    if (!booking) {
      logger.warn(`Webhook received for unknown booking: ${order_id}`);
      return;
    }

    let escrowStatus = booking.escrowStatus;
    let status = booking.status;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        escrowStatus = 'HOLD';
        status = 'PAID_DP';
      }
    } else if (transaction_status === 'settlement') {
      escrowStatus = 'HOLD';
      status = 'PAID_DP';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'expire' ||
      transaction_status === 'cancel'
    ) {
      escrowStatus = 'REFUNDED';
      status = 'BOOKED';
    }

    await prisma.booking.update({
      where: { id: order_id },
      data: { escrowStatus, status },
    });

    logger.info(`Webhook processed for booking: ${order_id}, status: ${status}`);
  }

  /**
   * Release escrow funds to seller
   */
  static async releaseEscrow(bookingId: string, adminId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        seller: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.escrowStatus !== 'HOLD') {
      throw new AppError('Dana tidak dapat dilepaskan', 400);
    }

    // Calculate platform fee (2.5%)
    const platformFee = Number(booking.totalPrice) * 0.025;
    const sellerAmount = Number(booking.totalPrice) - platformFee;

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        escrowStatus: 'RELEASED',
        status: 'COMPLETED',
      },
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { status: 'SOLD' },
    });

    logger.info(`Escrow released for booking: ${bookingId} by admin: ${adminId}`);

    return {
      bookingId,
      platformFee,
      sellerAmount,
      sellerId: booking.sellerId,
    };
  }

  /**
   * Refund payment to buyer
   */
  static async refundPayment(bookingId: string, adminId: string, reason: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.escrowStatus === 'RELEASED') {
      throw new AppError('Dana sudah dilepaskan, tidak dapat direfund', 400);
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        escrowStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
    });

    // Update listing status back to PUBLISHED
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { status: 'PUBLISHED' },
    });

    logger.info(`Refund processed for booking: ${bookingId} by admin: ${adminId}. Reason: ${reason}`);

    return {
      bookingId,
      refundAmount: booking.downPayment,
    };
  }
}

export default PaymentService;
