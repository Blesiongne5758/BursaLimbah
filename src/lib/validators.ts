/**
 * BursaLimbah.com - Form Validation Schemas
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)[2-9][0-9]{7,11}$/, 'Format nomor telepon tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  confirmPassword: z.string(),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  membershipTier: z.enum(['PERSONAL', 'SMALL_BUSINESS', 'CORPORATE']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Listing creation schema
 */
export const listingSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .min(10, 'Judul minimal 10 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi')
    .min(50, 'Deskripsi minimal 50 karakter')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
  category: z.enum([
    'PLASTIC', 'PAPER', 'METAL', 'ELECTRONIC',
    'ORGANIC', 'B3', 'INDUSTRIAL', 'TEXTILE', 'CONSTRUCTION'
  ]),
  subCategory: z.string().min(1, 'Sub-kategori wajib diisi'),
  quantity: z
    .number()
    .min(1, 'Quantity minimal 1')
    .max(1000000, 'Quantity maksimal 1.000.000'),
  unit: z.enum(['kg', 'ton', 'liter', 'm3', 'unit']),
  basePrice: z
    .number()
    .min(100, 'Harga minimal Rp 100')
    .max(10000000, 'Harga maksimal Rp 10.000.000'),
  negotiable: z.boolean().default(true),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  images: z.array(z.string()).max(10, 'Maksimal 10 gambar'),
});

export type ListingFormData = z.infer<typeof listingSchema>;

/**
 * Booking schema
 */
export const bookingSchema = z.object({
  listingId: z.string().min(1),
  quantity: z
    .number()
    .min(1, 'Quantity minimal 1')
    .max(100000, 'Quantity maksimal 100.000'),
  pickupDate: z
    .string()
    .min(1, 'Tanggal pickup wajib diisi'),
  pickupMethod: z.enum(['SELF', 'COURIER']),
  courierId: z.string().optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
}).refine((data) => {
  const pickupDate = new Date(data.pickupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return pickupDate >= today;
}, {
  message: 'Tanggal pickup tidak boleh di masa lalu',
  path: ['pickupDate'],
});

export type BookingFormData = z.infer<typeof bookingSchema>;

/**
 * KYC KTP schema
 */
export const kycKTPSchema = z.object({
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d{16}$/, 'NIK hanya boleh angka'),
  fullName: z
    .string()
    .min(1, 'Nama sesuai KTP wajib diisi')
    .min(3, 'Nama minimal 3 karakter'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  photo: z.string().min(1, 'Foto KTP wajib diupload'),
});

export type KYCKTPData = z.infer<typeof kycKTPSchema>;

/**
 * KYC NPWP schema
 */
export const kycNPWPSchema = z.object({
  npwp: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, 'Format NPWP tidak valid'),
  companyName: z.string().min(1, 'Nama perusahaan wajib diisi'),
  document: z.string().min(1, 'Dokumen NPWP wajib diupload'),
});

export type KYCNPWPData = z.infer<typeof kycNPWPSchema>;

/**
 * KYC NIB schema
 */
export const kycNIBSchema = z.object({
  nib: z
    .string()
    .length(13, 'NIB harus 13 digit')
    .regex(/^\d{13}$/, 'NIB hanya boleh angka'),
  businessField: z.string().min(1, 'Bidang usaha wajib diisi'),
  document: z.string().min(1, 'Dokumen NIB wajib diupload'),
});

export type KYCNIBData = z.infer<typeof kycNIBSchema>;

/**
 * Environmental permit schema (for B3 waste)
 */
export const environmentalPermitSchema = z.object({
  permitNumber: z
    .string()
    .min(1, 'Nomor izin wajib diisi')
    .regex(/^SKT-\d{4}-\d{3,}$/, 'Format nomor izin tidak valid (contoh: SKT-2024-001)'),
  issuer: z.string().min(1, 'Penerbit izin wajib diisi'),
  issueDate: z.string().min(1, 'Tanggal terbit wajib diisi'),
  expiryDate: z.string().min(1, 'Tanggal kadaluarsa wajib diisi'),
  document: z.string().min(1, 'Dokumen izin wajib diupload'),
}).refine((data) => {
  const issueDate = new Date(data.issueDate);
  const expiryDate = new Date(data.expiryDate);
  return expiryDate > issueDate;
}, {
  message: 'Tanggal kadaluarsa harus setelah tanggal terbit',
  path: ['expiryDate'],
});

export type EnvironmentalPermitData = z.infer<typeof environmentalPermitSchema>;

/**
 * Negotiation message schema
 */
export const negotiationSchema = z.object({
  listingId: z.string().min(1),
  offeredPrice: z
    .number()
    .min(1, 'Harga tawaran wajib diisi')
    .max(10000000, 'Harga tawaran terlalu tinggi'),
  quantity: z
    .number()
    .min(1, 'Quantity minimal 1'),
  message: z
    .string()
    .max(500, 'Pesan maksimal 500 karakter')
    .optional(),
});

export type NegotiationData = z.infer<typeof negotiationSchema>;

/**
 * Contact form schema
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(3, 'Nama minimal 3 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  subject: z.string().min(1, 'Subjek wajib diisi').min(5, 'Subjek minimal 5 karakter'),
  message: z.string().min(1, 'Pesan wajib diisi').min(10, 'Pesan minimal 10 karakter').max(1000, 'Pesan maksimal 1000 karakter'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Helper function to validate form data
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}
