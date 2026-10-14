/**
 * Booking Service
 * Business logic for bookings and transactions
 */

import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';

export class BookingService {
  /**
   * Create new booking
   */
  static async createBooking(data: any, userId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing) {
      throw new NotFoundError('Listing tidak ditemukan');
    }

    if (listing.status !== 'PUBLISHED') {
      throw new AppError('Listing tidak tersedia untuk dipesan', 400);
    }

    if (listing.quantity < data.quantity) {
      throw new AppError('Quantity tidak mencukupi', 400);
    }

    // Check if user already has active booking for this listing
    const existingBooking = await prisma.booking.findFirst({
      where: {
        listingId: data.listingId,
        buyerId: userId,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
      },
    });

    if (existingBooking) {
      throw new AppError('Anda sudah memiliki booking aktif untuk listing ini', 400);
    }

    const totalPrice = Number(listing.basePrice) * data.quantity;
    const downPayment = totalPrice * 0.3; // 30% DP

    const booking = await prisma.booking.create({
      data: {
        listingId: data.listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        quantity: data.quantity,
        pricePerKg: listing.basePrice,
        totalPrice,
        downPayment,
        pickupDate: new Date(data.pickupDate),
        pickupMethod: data.pickupMethod,
        courierId: data.courierId,
        paymentMethod: 'MIDTRANS',
        escrowStatus: 'PENDING',
        status: 'BOOKED',
      },
      include: {
        listing: true,
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
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: data.listingId },
      data: { status: 'NEGOTIATING' },
    });

    logger.info(`Booking created: ${booking.id} by user ${userId}`);

    return booking;
  }

  /**
   * Get user bookings
   */
  static async getUserBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            city: true,
            province: true,
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

    return bookings;
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        validation: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.buyerId !== userId && booking.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses ke booking ini');
    }

    return booking;
  }

  /**
   * Validate booking (buyer confirms receipt)
   */
  static async validateBooking(
    bookingId: string,
    userId: string,
    validationData: any
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.buyerId !== userId) {
      throw new ForbiddenError('Hanya buyer yang dapat memvalidasi booking');
    }

    if (booking.status !== 'DELIVERED') {
      throw new AppError('Booking belum dalam status DELIVERED', 400);
    }

    const validation = await prisma.validation.create({
      data: {
        bookingId,
        actualQuantity: validationData.actualQuantity,
        actualPhotos: validationData.photos,
        finalPrice: validationData.finalPrice,
        conditionNotes: validationData.conditionNotes,
        validatedById: userId,
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'VALIDATED',
        finalPrice: validationData.finalPrice,
      },
    });

    // Release escrow to seller
    await this.releaseEscrow(bookingId);

    logger.info(`Booking validated: ${bookingId} by user ${userId}`);

    return validation;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, userId: string, reason: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.buyerId !== userId && booking.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk membatalkan booking ini');
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new AppError('Booking tidak dapat dibatalkan', 400);
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        escrowStatus: 'REFUNDED',
      },
    });

    // Update listing status back to PUBLISHED
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { status: 'PUBLISHED' },
    });

    logger.info(`Booking cancelled: ${bookingId} by user ${userId}. Reason: ${reason}`);
  }

  /**
   * Release escrow to seller
   */
  static async releaseEscrow(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    // Calculate platform fee (2.5%)
    const platformFee = Number(booking.totalPrice) * 0.025;
    const sellerAmount = Number(booking.totalPrice) - platformFee;

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        escrowStatus: 'RELEASED',
      },
    });

    // Update listing status
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { status: 'SOLD' },
    });

    logger.info(`Escrow released for booking: ${bookingId}. Seller amount: ${sellerAmount}`);

    return {
      bookingId,
      platformFee,
      sellerAmount,
    };
  }
}

export default BookingService;
