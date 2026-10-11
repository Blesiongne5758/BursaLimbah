/**
 * BursaLimbah.com - Security Utilities
 * Real AES-256-GCM encryption for location data
 * Compliant with UU PDP No. 27/2023
 */

/**
 * Generate a random encryption key (32 bytes / 256 bits)
 * In production, this should be stored securely (env variable / KMS)
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt coordinates using AES-256-GCM
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param key - CryptoKey (AES-256)
 * @returns Base64 encoded encrypted string
 * 
 * @example
 * const key = await generateEncryptionKey();
 * const encrypted = await encryptCoords(-7.2575, 112.7521, key);
 */
export async function encryptCoords(
  lat: number,
  lng: number,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const data = new TextEncoder().encode(`${lat}:${lng}`);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt coordinates using AES-256-GCM
 * 
 * @param encrypted - Base64 encoded encrypted string
 * @param key - CryptoKey (AES-256)
 * @returns Decrypted coordinates or null if failed
 * 
 * @example
 * const coords = await decryptCoords(encrypted, key);
 * if (coords) {
 *   console.log(coords.lat, coords.lng);
 * }
 */
export async function decryptCoords(
  encrypted: string,
  key: CryptoKey
): Promise<{ lat: number; lng: number } | null> {
  try {
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const [lat, lng] = new TextDecoder().decode(decrypted).split(':').map(Number);
    return { lat, lng };
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Export CryptoKey to base64 string (for storage)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import CryptoKey from base64 string
 */
export async function importKey(base64: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash data using SHA-256 (for location verification without reveal)
 */
export async function hashLocation(lat: number, lng: number): Promise<string> {
  const data = new TextEncoder().encode(`${lat}:${lng}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify location hash matches
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
 * Generate random token for CSRF protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize HTML to prevent XSS
 * Simple implementation - use DOMPurify in production
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
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
 * Validate Indonesian NPWP format
 */
export function isValidNPWP(npwp: string): boolean {
  const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
  return npwpRegex.test(npwp);
}

/**
 * Validate Indonesian NIK (16 digits)
 */
export function isValidNIK(nik: string): boolean {
  const nikRegex = /^\d{16}$/;
  return nikRegex.test(nik);
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Minimal 8 karakter');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Gunakan huruf besar dan kecil');

  if (/\d/.test(password)) score++;
  else feedback.push('Tambahkan angka');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Tambahkan simbol (!@#$)');

  const level = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong';

  return { score, level, feedback };
}

/**
 * Rate limiter for client-side operations
 */
export class RateLimiter {
  private attempts: number = 0;
  private lockUntil: number = 0;
  private readonly maxAttempts: number;
  private readonly lockDuration: number;

  constructor(maxAttempts: number = 5, lockDurationMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockDuration = lockDurationMs;
  }

  canAttempt(): boolean {
    if (Date.now() < this.lockUntil) return false;
    return this.attempts < this.maxAttempts;
  }

  recordAttempt(): void {
    this.attempts++;
    if (this.attempts >= this.maxAttempts) {
      this.lockUntil = Date.now() + this.lockDuration;
    }
  }

  reset(): void {
    this.attempts = 0;
    this.lockUntil = 0;
  }

  getRemainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attempts);
  }

  getLockTimeRemaining(): number {
    return Math.max(0, this.lockUntil - Date.now());
  }
}
