/**
 * Unit tests for form validators
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  listingSchema,
  bookingSchema,
  kycKTPSchema,
  validateForm,
} from '../lib/validators';

describe('Form Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty fields', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+6281234567890',
        password: 'Password123',
        confirmPassword: 'Password123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        membershipTier: 'PERSONAL',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+6281234567890',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        membershipTier: 'PERSONAL',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+6281234567890',
        password: 'weak',
        confirmPassword: 'weak',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        membershipTier: 'PERSONAL',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('listingSchema', () => {
    it('should validate correct listing data', () => {
      const result = listingSchema.safeParse({
        title: 'Limbah Plastik PP Grade A',
        description: 'Limbah plastik dari pabrik kemasan makanan. Kondisi bersih dan sudah dicacah.',
        category: 'PLASTIC',
        subCategory: 'PP',
        quantity: 5000,
        unit: 'kg',
        basePrice: 4500,
        negotiable: true,
        city: 'Surabaya',
        province: 'Jawa Timur',
        images: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const result = listingSchema.safeParse({
        title: 'Short',
        description: 'Limbah plastik dari pabrik kemasan makanan. Kondisi bersih dan sudah dicacah.',
        category: 'PLASTIC',
        subCategory: 'PP',
        quantity: 5000,
        unit: 'kg',
        basePrice: 4500,
        negotiable: true,
        city: 'Surabaya',
        province: 'Jawa Timur',
        images: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = listingSchema.safeParse({
        title: 'Limbah Plastik PP Grade A',
        description: 'Limbah plastik dari pabrik kemasan makanan. Kondisi bersih dan sudah dicacah.',
        category: 'PLASTIC',
        subCategory: 'PP',
        quantity: 5000,
        unit: 'kg',
        basePrice: -100,
        negotiable: true,
        city: 'Surabaya',
        province: 'Jawa Timur',
        images: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('bookingSchema', () => {
    it('should validate correct booking data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const result = bookingSchema.safeParse({
        listingId: 'listing-123',
        quantity: 1000,
        pickupDate: futureDate.toISOString().split('T')[0],
        pickupMethod: 'SELF',
      });
      expect(result.success).toBe(true);
    });

    it('should reject past pickup date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const result = bookingSchema.safeParse({
        listingId: 'listing-123',
        quantity: 1000,
        pickupDate: pastDate.toISOString().split('T')[0],
        pickupMethod: 'SELF',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('kycKTPSchema', () => {
    it('should validate correct KTP data', () => {
      const result = kycKTPSchema.safeParse({
        nik: '3201234567890123',
        fullName: 'John Doe',
        birthDate: '1990-01-01',
        photo: 'https://example.com/ktp.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid NIK', () => {
      const result = kycKTPSchema.safeParse({
        nik: '123456789012345', // 15 digits
        fullName: 'John Doe',
        birthDate: '1990-01-01',
        photo: 'https://example.com/ktp.jpg',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateForm helper', () => {
    it('should return success for valid data', () => {
      const result = validateForm(loginSchema, {
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should return errors for invalid data', () => {
      const result = validateForm(loginSchema, {
        email: 'invalid',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('email');
        expect(result.errors).toHaveProperty('password');
      }
    });
  });
});
