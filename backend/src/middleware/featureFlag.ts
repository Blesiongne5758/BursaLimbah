/**
 * Feature Flag Middleware
 * Check if feature is enabled before allowing access
 */

import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from '../services/featureFlag.service';
import { AppError } from '../utils/errors';

/**
 * Middleware to check if feature is enabled
 */
export const requireFeature = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isEnabled = await FeatureFlagService.isEnabled(featureKey);

      if (!isEnabled) {
        throw new AppError(
          `Fitur ini sedang dinonaktifkan. Silakan hubungi administrator.`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Gagal memeriksa fitur', 500));
      }
    }
  };
};

/**
 * Middleware to check multiple features (all must be enabled)
 */
export const requireFeatures = (featureKeys: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await FeatureFlagService.checkFlags(featureKeys);

      const disabledFeatures = featureKeys.filter(key => !results[key]);

      if (disabledFeatures.length > 0) {
        throw new AppError(
          `Fitur berikut sedang dinonaktifkan: ${disabledFeatures.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Gagal memeriksa fitur', 500));
      }
    }
  };
};

/**
 * Middleware to check if any feature is enabled (at least one)
 */
export const requireAnyFeature = (featureKeys: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await FeatureFlagService.checkFlags(featureKeys);

      const hasAnyEnabled = featureKeys.some(key => results[key]);

      if (!hasAnyEnabled) {
        throw new AppError(
          'Fitur ini sedang dinonaktifkan. Silakan hubungi administrator.',
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Gagal memeriksa fitur', 500));
      }
    }
  };
};

/**
 * Middleware to attach feature flags to request
 */
export const attachFeatureFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await FeatureFlagService.getEnabledFlags();
    (req as any).features = flags.reduce((acc: any, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {});

    next();
  } catch (error) {
    // Don't block request if feature flag check fails
    (req as any).features = {};
    next();
  }
};

export default {
  requireFeature,
  requireFeatures,
  requireAnyFeature,
  attachFeatureFlags,
};
