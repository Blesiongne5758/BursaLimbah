/**
 * Unit tests for security utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidNPWP,
  isValidNIK,
  checkPasswordStrength,
  sanitizeHTML,
  RateLimiter,
} from '../lib/security';

describe('Security Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Indonesian phone numbers', () => {
      expect(isValidPhone('+6281234567890')).toBe(true);
      expect(isValidPhone('6281234567890')).toBe(true);
      expect(isValidPhone('081234567890')).toBe(true);
      expect(isValidPhone('0812-3456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('+1234567890')).toBe(false); // Not Indonesian
    });
  });

  describe('isValidNPWP', () => {
    it('should validate correct NPWP format', () => {
      expect(isValidNPWP('01.234.567.8-901.000')).toBe(true);
      expect(isValidNPWP('12.345.678.9-012.000')).toBe(true);
    });

    it('should reject invalid NPWP format', () => {
      expect(isValidNPWP('')).toBe(false);
      expect(isValidNPWP('123456789')).toBe(false);
      expect(isValidNPWP('01.234.567.8-901')).toBe(false);
    });
  });

  describe('isValidNIK', () => {
    it('should validate 16-digit NIK', () => {
      expect(isValidNIK('3201234567890123')).toBe(true);
      expect(isValidNIK('1234567890123456')).toBe(true);
    });

    it('should reject invalid NIK', () => {
      expect(isValidNIK('')).toBe(false);
      expect(isValidNIK('123456789012345')).toBe(false); // 15 digits
      expect(isValidNIK('12345678901234567')).toBe(false); // 17 digits
      expect(isValidNIK('abcdefghijklmnop')).toBe(false); // Not numbers
    });
  });

  describe('checkPasswordStrength', () => {
    it('should rate weak passwords', () => {
      const result = checkPasswordStrength('123');
      expect(result.level).toBe('weak');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should rate strong passwords', () => {
      const result = checkPasswordStrength('MyP@ssw0rd123!');
      expect(result.level).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should provide feedback for missing requirements', () => {
      const result = checkPasswordStrength('password');
      expect(result.feedback).toContain('Password harus mengandung huruf besar');
      expect(result.feedback).toContain('Password harus mengandung angka');
    });
  });

  describe('sanitizeHTML', () => {
    it('should escape HTML tags', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    it('should preserve text content', () => {
      const text = 'Hello World';
      const sanitized = sanitizeHTML(text);
      expect(sanitized).toBe(text);
    });
  });

  describe('RateLimiter', () => {
    it('should allow initial attempts', () => {
      const limiter = new RateLimiter(5, 15 * 60 * 1000);
      expect(limiter.canAttempt()).toBe(true);
      expect(limiter.getRemainingAttempts()).toBe(5);
    });

    it('should track attempts', () => {
      const limiter = new RateLimiter(5, 15 * 60 * 1000);
      limiter.recordAttempt();
      expect(limiter.getRemainingAttempts()).toBe(4);
    });

    it('should lock after max attempts', () => {
      const limiter = new RateLimiter(5, 15 * 60 * 1000);
      for (let i = 0; i < 5; i++) {
        limiter.recordAttempt();
      }
      expect(limiter.canAttempt()).toBe(false);
      expect(limiter.getRemainingAttempts()).toBe(0);
    });

    it('should reset correctly', () => {
      const limiter = new RateLimiter(5, 15 * 60 * 1000);
      limiter.recordAttempt();
      limiter.recordAttempt();
      limiter.reset();
      expect(limiter.getRemainingAttempts()).toBe(5);
      expect(limiter.canAttempt()).toBe(true);
    });
  });
});
