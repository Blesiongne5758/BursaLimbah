/**
 * Listing Service
 * Business logic for waste listings
 */

import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';
import { encryptCoords, hashLocation, decryptCoords } from '../utils/security';

export class ListingService {
  /**
   * Get all listings with filters and pagination
   */
  static async getAllListings(filters: any, pagination: any) {
    const cacheKey = `listings:${JSON.stringify(filters)}:${pagination.page}:${pagination.limit}`;
    
    // Try to get from cache
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {
      status: 'PUBLISHED',
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {};
      if (filters.minPrice) where.basePrice.gte = filters.minPrice;
      if (filters.maxPrice) where.basePrice.lte = filters.maxPrice;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              membershipTier: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.listing.count({ where }),
    ]);

    // Remove sensitive data
    const sanitizedListings = listings.map(listing => ({
      ...listing,
      encryptedCoords: undefined,
      locationHash: undefined,
    }));

    const result = {
      listings: sanitizedListings,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get listing by ID
   */
  static async getListingById(id: string, userId?: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            membershipTier: true,
            city: true,
            province: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundError('Listing tidak ditemukan');
    }

    // Check if user has booking with DP paid
    let canViewLocation = false;
    if (userId) {
      const booking = await prisma.booking.findFirst({
        where: {
          listingId: id,
          buyerId: userId,
          escrowStatus: { in: ['HOLD', 'RELEASED'] },
        },
      });
      canViewLocation = !!booking;
    }

    return {
      ...listing,
      encryptedCoords: undefined,
      locationHash: undefined,
      canViewLocation,
    };
  }

  /**
   * Create new listing
   */
  static async createListing(data: any, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Check listing limit based on membership tier
    const listingCount = await prisma.listing.count({
      where: { sellerId: userId, status: { not: 'ARCHIVED' } },
    });

    const limits: Record<string, number> = {
      PERSONAL: 5,
      SMALL_BUSINESS: 25,
      CORPORATE: Infinity,
    };

    if (listingCount >= limits[user.membershipTier]) {
      throw new AppError(
        `Anda telah mencapai batas listing untuk tier ${user.membershipTier}`,
        403
      );
    }

    // Encrypt coordinates
    const encryptedCoords = await encryptCoords(data.lat, data.lng);
    const locationHash = await hashLocation(data.lat, data.lng);

    const listing = await prisma.listing.create({
      data: {
        sellerId: userId,
        category: data.category,
        subCategory: data.subCategory,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        basePrice: data.basePrice,
        negotiable: data.negotiable,
        city: data.city,
        province: data.province,
        encryptedCoords,
        locationHash,
        status: 'PUBLISHED',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            membershipTier: true,
          },
        },
      },
    });

    // Invalidate cache
    await cache.invalidate('listings:*');

    logger.info(`Listing created: ${listing.id} by user ${userId}`);

    return {
      ...listing,
      encryptedCoords: undefined,
      locationHash: undefined,
    };
  }

  /**
   * Update listing
   */
  static async updateListing(id: string, data: any, userId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing tidak ditemukan');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk mengedit listing ini');
    }

    // Re-encrypt coordinates if changed
    let encryptedCoords = listing.encryptedCoords;
    let locationHash = listing.locationHash;

    if (data.lat && data.lng) {
      encryptedCoords = await encryptCoords(data.lat, data.lng);
      locationHash = await hashLocation(data.lat, data.lng);
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        encryptedCoords,
        locationHash,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            membershipTier: true,
          },
        },
      },
    });

    // Invalidate cache
    await cache.invalidate('listings:*');

    logger.info(`Listing updated: ${id} by user ${userId}`);

    return {
      ...updatedListing,
      encryptedCoords: undefined,
      locationHash: undefined,
    };
  }

  /**
   * Delete listing
   */
  static async deleteListing(id: string, userId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing tidak ditemukan');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk menghapus listing ini');
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // Invalidate cache
    await cache.invalidate('listings:*');

    logger.info(`Listing deleted: ${id} by user ${userId}`);
  }

  /**
   * Get my listings
   */
  static async getMyListings(userId: string, pagination: any) {
    const skip = (pagination.page - 1) * pagination.limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.listing.count({ where: { sellerId: userId } }),
    ]);

    return {
      listings,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Decrypt location (requires booking + DP)
   */
  static async decryptLocation(listingId: string, userId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError('Listing tidak ditemukan');
    }

    // Check if user has booking with DP paid
    const booking = await prisma.booking.findFirst({
      where: {
        listingId,
        buyerId: userId,
        escrowStatus: { in: ['HOLD', 'RELEASED'] },
      },
    });

    if (!booking) {
      throw new ForbiddenError('Anda harus melakukan booking dan membayar DP untuk melihat lokasi');
    }

    // Decrypt coordinates
    const coords = await decryptCoords(listing.encryptedCoords);

    if (!coords) {
      throw new AppError('Gagal mendekripsi lokasi', 500);
    }

    logger.info(`Location decrypted for listing ${listingId} by user ${userId}`);

    return coords;
  }
}

export default ListingService;
