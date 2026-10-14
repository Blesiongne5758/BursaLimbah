/**
 * Validation Schemas
 * Zod schemas for request validation
 */

import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

// Listing schemas
export const createListingSchema = z.object({
  title: z.string().min(10, 'Judul minimal 10 karakter'),
  description: z.string().min(50, 'Deskripsi minimal 50 karakter'),
  category: z.enum([
    'PLASTIC',
    'PAPER',
    'METAL',
    'ELECTRONIC',
    'ORGANIC',
    'B3',
    'INDUSTRIAL',
    'TEXTILE',
    'CONSTRUCTION',
  ]),
  subCategory: z.string(),
  quantity: z.number().positive('Quantity harus positif'),
  unit: z.enum(['kg', 'ton', 'liter', 'm3', 'unit']),
  basePrice: z.number().positive('Harga harus positif'),
  negotiable: z.boolean().default(true),
  city: z.string(),
  province: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const updateListingSchema = createListingSchema.partial();

// Booking schemas
export const createBookingSchema = z.object({
  listingId: z.string(),
  quantity: z.number().positive('Quantity harus positif'),
  pickupDate: z.string().datetime(),
  pickupMethod: z.enum(['SELF', 'COURIER']),
  courierId: z.string().optional(),
});

// KYC schemas
export const submitKTPSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  fullName: z.string().min(3, 'Nama minimal 3 karakter'),
  birthDate: z.string(),
  photo: z.string(),
});

export const submitNPWPSchema = z.object({
  npwp: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, 'Format NPWP tidak valid'),
  companyName: z.string(),
  document: z.string(),
});

export const submitNIBSchema = z.object({
  nib: z.string().length(13, 'NIB harus 13 digit'),
  businessField: z.string(),
  document: z.string(),
});

// Chat schemas
export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  content: z.string().min(1, 'Pesan tidak boleh kosong'),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Filter schemas
export const listingFilterSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
});

export default {
  loginSchema,
  registerSchema,
  createListingSchema,
  updateListingSchema,
  createBookingSchema,
  submitKTPSchema,
  submitNPWPSchema,
  submitNIBSchema,
  sendMessageSchema,
  paginationSchema,
  listingFilterSchema,
};
