/**
 * Authentication Service
 * JWT token management and user authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  /**
   * Register new user
   */
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    city?: string;
    province?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        city: data.city,
        province: data.province,
        role: 'USER',
        membershipTier: 'PERSONAL',
        kycStatus: 'PENDING',
      },
    });

    logger.info(`User registered: ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      membershipTier: user.membershipTier,
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthTokens & { user: any }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Email atau password salah', 401);
    }

    // Check if user is active
    if (user.kycStatus === 'REJECTED') {
      throw new AppError('Akun Anda telah ditangguhkan', 403);
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in cache
    await cache.set(`refresh_token:${tokens.refreshToken}`, user.id, 30 * 24 * 60 * 60); // 30 days

    logger.info(`User logged in: ${user.id}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipTier: user.membershipTier,
        kycStatus: user.kycStatus,
      },
    };
  }

  /**
   * Generate JWT tokens
   */
  static async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new AppError('Token tidak valid atau sudah kedaluwarsa', 401);
    }
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
      
      // Check if token exists in cache
      const cachedUserId = await cache.get<string>(`refresh_token:${token}`);
      if (!cachedUserId) {
        throw new AppError('Refresh token tidak valid', 401);
      }

      return payload.userId;
    } catch (error) {
      throw new AppError('Refresh token tidak valid', 401);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const userId = await this.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Generate new tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Invalidate old refresh token
    await cache.del(`refresh_token:${refreshToken}`);

    // Store new refresh token
    await cache.set(`refresh_token:${tokens.refreshToken}`, user.id, 30 * 24 * 60 * 60);

    return tokens;
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string): Promise<void> {
    await cache.del(`refresh_token:${refreshToken}`);
    logger.info('User logged out');
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Password saat ini salah', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info(`Password changed for user: ${userId}`);
  }
}

export default AuthService;
