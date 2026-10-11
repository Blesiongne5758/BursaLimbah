/**
 * Mock Backend API Service
 * Simulates Next.js API routes for development
 * Ready to migrate to real Next.js backend
 */

import { MOCK_USERS, MOCK_LISTINGS, MOCK_TRANSACTIONS } from '../data';
import type { User, Listing, Booking } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory database (simulates PostgreSQL)
let users = [...MOCK_USERS];
let listings = [...MOCK_LISTINGS];
let bookings = [...MOCK_TRANSACTIONS];

export const mockAPI = {
  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth: {
    login: async (email: string, password: string) => {
      await delay(800);
      
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Email atau password salah');
      }

      // Simulate password check (in real backend, use bcrypt)
      if (password !== 'password123') {
        throw new Error('Email atau password salah');
      }

      return {
        token: `mock_token_${user.id}_${Date.now()}`,
        user: {
          ...user,
          passwordHash: undefined, // Never send password hash
        },
      };
    },

    register: async (data: Partial<User>) => {
      await delay(1000);

      // Check if user exists
      if (users.find(u => u.email === data.email)) {
        throw new Error('Email sudah terdaftar');
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email || '',
        phone: data.phone,
        name: data.name || '',
        role: 'USER',
        membershipTier: data.membershipTier || 'PERSONAL',
        kycStatus: 'PENDING',
        city: data.city || '',
        province: data.province || '',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      return {
        message: 'Registrasi berhasil',
        userId: newUser.id,
      };
    },

    logout: async () => {
      await delay(200);
      return { message: 'Logout berhasil' };
    },

    me: async (token: string) => {
      await delay(300);

      // Extract user ID from token
      const userId = token.split('_')[2];
      const user = users.find(u => u.id === userId);

      if (!user) {
        throw new Error('Unauthorized');
      }

      return user;
    },
  },

  // ============================================
  // LISTINGS ENDPOINTS
  // ============================================
  listings: {
    getAll: async (params?: {
      category?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
    }) => {
      await delay(500);

      let filteredListings = [...listings];

      if (params?.category) {
        filteredListings = filteredListings.filter(l => l.category === params.category);
      }

      if (params?.city) {
        filteredListings = filteredListings.filter(l => 
          l.city.toLowerCase().includes(params.city!.toLowerCase())
        );
      }

      if (params?.minPrice) {
        filteredListings = filteredListings.filter(l => (l.pricePerKg || 0) >= params.minPrice!);
      }

      if (params?.maxPrice) {
        filteredListings = filteredListings.filter(l => (l.pricePerKg || 0) <= params.maxPrice!);
      }

      // Remove sensitive data
      return filteredListings.map(l => ({
        ...l,
        encryptedCoords: undefined, // Never send encrypted coords
      }));
    },

    getById: async (id: string) => {
      await delay(300);

      const listing = listings.find(l => l.id === id);
      if (!listing) {
        throw new Error('Listing tidak ditemukan');
      }

      return {
        ...listing,
        encryptedCoords: undefined, // Never send encrypted coords
      };
    },

    create: async (data: Partial<Listing>, userId: string) => {
      await delay(800);

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Unauthorized');
      }

      const newListing: Listing = {
        id: `listing_${Date.now()}`,
        sellerId: userId,
        sellerName: user.name,
        sellerTier: user.membershipTier,
        category: data.category || 'PLASTIC',
        subCategory: data.subCategory || data.category || 'PLASTIC',
        title: data.title || '',
        description: data.description || '',
        quantity: data.quantity || 0,
        unit: data.unit || 'kg',
        basePrice: data.basePrice || 0,
        pricePerKg: data.basePrice || 0,
        negotiable: data.negotiable ?? true,
        city: data.city || '',
        province: data.province || '',
        encryptedCoords: data.encryptedCoords || '',
        locationHash: data.locationHash || '',
        status: 'PUBLISHED',
        aiGenerated: data.aiGenerated || false,
        priceTier: data.priceTier || 'BRONZE',
        createdAt: new Date().toISOString(),
        isB3: data.category === 'B3',
        images: data.images || [],
      };

      listings.push(newListing);

      return newListing;
    },

    update: async (id: string, data: Partial<Listing>, userId: string) => {
      await delay(600);

      const index = listings.findIndex(l => l.id === id);
      if (index === -1) {
        throw new Error('Listing tidak ditemukan');
      }

      if (listings[index].sellerId !== userId) {
        throw new Error('Unauthorized');
      }

      listings[index] = { ...listings[index], ...data };

      return listings[index];
    },

    delete: async (id: string, userId: string) => {
      await delay(400);

      const index = listings.findIndex(l => l.id === id);
      if (index === -1) {
        throw new Error('Listing tidak ditemukan');
      }

      if (listings[index].sellerId !== userId) {
        throw new Error('Unauthorized');
      }

      listings.splice(index, 1);

      return { message: 'Listing berhasil dihapus' };
    },
  },

  // ============================================
  // BOOKINGS ENDPOINTS
  // ============================================
  bookings: {
    getAll: async (userId: string) => {
      await delay(500);

      return bookings.filter(b => 
        b.buyerId === userId || b.sellerId === userId
      );
    },

    getById: async (id: string, userId: string) => {
      await delay(300);

      const booking = bookings.find(b => b.id === id);
      if (!booking) {
        throw new Error('Booking tidak ditemukan');
      }

      if (booking.buyerId !== userId && booking.sellerId !== userId) {
        throw new Error('Unauthorized');
      }

      return booking;
    },

    create: async (data: Partial<Booking>, userId: string) => {
      await delay(1000);

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Unauthorized');
      }

      const listing = listings.find(l => l.id === data.listingId);
      if (!listing) {
        throw new Error('Listing tidak ditemukan');
      }

      const totalPrice = (listing.pricePerKg || 0) * (data.quantity || 0);
      const downPayment = totalPrice * 0.3;

      const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        listingId: data.listingId || '',
        listingTitle: listing.title,
        buyerId: userId,
        buyerName: user.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        quantity: data.quantity || 0,
        pricePerKg: listing.pricePerKg || 0,
        totalPrice,
        downPayment,
        paymentMethod: 'MIDTRANS',
        escrowStatus: 'PENDING',
        pickupMethod: data.pickupMethod || 'SELF',
        status: 'BOOKED',
        createdAt: new Date().toISOString(),
        estimatedPickup: data.estimatedPickup || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        pickupDate: data.pickupDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      bookings.push(newBooking);

      return newBooking;
    },
  },

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================
  payment: {
    create: async (bookingId: string) => {
      await delay(1200);

      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking tidak ditemukan');
      }

      // Simulate Midtrans transaction
      return {
        transactionId: `TXN_${Date.now()}`,
        snapToken: `SNAP_${Math.random().toString(36).substring(2, 15)}`,
        dpAmount: booking.downPayment,
        totalAmount: booking.totalPrice,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    },

    verify: async (transactionId: string) => {
      await delay(1500);

      // Simulate payment verification
      const booking = bookings.find(b => b.id === transactionId);
      if (booking) {
        booking.escrowStatus = 'HOLD';
        booking.status = 'PAID_DP';
      }

      return {
        status: 'success',
        orderId: `ORD_${transactionId.split('_')[1]}`,
      };
    },

    status: async (bookingId: string) => {
      await delay(300);

      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking tidak ditemukan');
      }

      return {
        bookingId: booking.id,
        escrowStatus: booking.escrowStatus,
        status: booking.status,
      };
    },
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================
  admin: {
    getUsers: async () => {
      await delay(500);
      return users;
    },

    getListings: async () => {
      await delay(500);
      return listings;
    },

    moderateListing: async (id: string, action: 'approve' | 'reject') => {
      await delay(600);

      const listing = listings.find(l => l.id === id);
      if (!listing) {
        throw new Error('Listing tidak ditemukan');
      }

      if (action === 'approve') {
        listing.status = 'PUBLISHED';
      } else {
        listing.status = 'ARCHIVED';
      }

      return listing;
    },

    getStats: async () => {
      await delay(400);

      return {
        totalUsers: users.length,
        totalListings: listings.length,
        totalBookings: bookings.length,
        revenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
      };
    },
  },
};

export default mockAPI;
