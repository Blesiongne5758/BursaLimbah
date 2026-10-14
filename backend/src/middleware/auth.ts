/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';
import { AppError } from '../utils/errors';
import { prisma } from '../lib/prisma';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { id: string };
    }
  }
}

/**
 * Authenticate user with JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token tidak ditemukan', 401);
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);

    // Attach user to request
    req.user = { ...payload, id: payload.userId };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Token tidak valid', 401));
    }
  }
};

/**
 * Require specific roles
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Require specific membership tier
 */
export const requireTier = (...tiers: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!tiers.includes(user.membershipTier)) {
        throw new AppError('Insufficient membership tier', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication (doesn't throw error if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyAccessToken(token);
      req.user = { ...payload, id: payload.userId };
    }

    next();
  } catch (error) {
    // Don't throw error, just continue without user
    next();
  }
};

export default {
  authenticate,
  requireRole,
  requireTier,
  optionalAuth,
};
