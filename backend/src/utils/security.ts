/**
 * Security Utilities
 * Encryption, hashing, and security functions
 */

import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt coordinates using AES-256-GCM
 */
export async function encryptCoords(lat: number, lng: number): Promise<string> {
  const key = Buffer.from(config.encryption.locationKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const data = JSON.stringify({ lat, lng });
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + Encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt coordinates using AES-256-GCM
 */
export async function decryptCoords(encrypted: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const key = Buffer.from(config.encryption.locationKey, 'hex');
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [ivHex, authTagHex, encryptedData] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

/**
 * Hash location using SHA-256
 */
export async function hashLocation(lat: number, lng: number): Promise<string> {
  const data = JSON.stringify({ lat, lng });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify location hash
 */
export async function verifyLocationHash(
  lat: number,
  lng: number,
  hash: string
): Promise<boolean> {
  const computedHash = await hashLocation(lat, lng);
  return computedHash === hash;
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[2-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate Indonesian NPWP
 */
export function isValidNPWP(npwp: string): boolean {
  const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
  return npwpRegex.test(npwp);
}

/**
 * Validate Indonesian NIK
 */
export function isValidNIK(nik: string): boolean {
  const nikRegex = /^\d{16}$/;
  return nikRegex.test(nik);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
}

export default {
  encryptCoords,
  decryptCoords,
  hashLocation,
  verifyLocationHash,
  generateToken,
  hashPassword,
  verifyPassword,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidNPWP,
  isValidNIK,
  generateCSRFToken,
  verifyCSRFToken,
};
