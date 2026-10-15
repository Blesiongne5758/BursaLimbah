/**
 * Admin Configuration Routes
 * Feature flag management and system configuration
 */

import { Router, Request, Response } from 'express';
import { FeatureFlagService } from '../services/featureFlag.service';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All admin config routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

/**
 * @route GET /api/admin/config/features
 * @desc Get all feature flags
 * @access Admin
 */
router.get(
  '/features',
  asyncHandler(async (req: Request, res: Response) => {
    const flags = await FeatureFlagService.getAllFlags();

    res.json({
      success: true,
       flags,
    });
  })
);

/**
 * @route GET /api/admin/config/features/:key
 * @desc Get feature flag by key
 * @access Admin
 */
router.get(
  '/features/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const flag = await FeatureFlagService.getFlag(req.params.key);

    if (!flag) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag tidak ditemukan',
      });
    }

    res.json({
      success: true,
       flag,
    });
  })
);

/**
 * @route GET /api/admin/config/features/category/:category
 * @desc Get feature flags by category
 * @access Admin
 */
router.get(
  '/features/category/:category',
  asyncHandler(async (req: Request, res: Response) => {
    const flags = await FeatureFlagService.getFlagsByCategory(req.params.category);

    res.json({
      success: true,
       flags,
    });
  })
);

/**
 * @route POST /api/admin/config/features/:key/enable
 * @desc Enable feature flag
 * @access Admin
 */
router.post(
  '/features/:key/enable',
  asyncHandler(async (req: Request, res: Response) => {
    const flag = await FeatureFlagService.enableFlag(req.params.key, req.user!.id);

    res.json({
      success: true,
      message: 'Feature flag berhasil diaktifkan',
       flag,
    });
  })
);

/**
 * @route POST /api/admin/config/features/:key/disable
 * @desc Disable feature flag
 * @access Admin
 */
router.post(
  '/features/:key/disable',
  asyncHandler(async (req: Request, res: Response) => {
    const flag = await FeatureFlagService.disableFlag(req.params.key, req.user!.id);

    res.json({
      success: true,
      message: 'Feature flag berhasil dinonaktifkan',
       flag,
    });
  })
);

/**
 * @route PUT /api/admin/config/features/:key/metadata
 * @desc Update feature flag metadata
 * @access Admin
 */
router.put(
  '/features/:key/metadata',
  asyncHandler(async (req: Request, res: Response) => {
    const { metadata } = req.body;

    const flag = await FeatureFlagService.updateFlagMetadata(
      req.params.key,
      metadata,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Metadata feature flag berhasil diupdate',
       flag,
    });
  })
);

/**
 * @route POST /api/admin/config/features/initialize
 * @desc Initialize default feature flags
 * @access Admin
 */
router.post(
  '/features/initialize',
  asyncHandler(async (req: Request, res: Response) => {
    await FeatureFlagService.initializeDefaults();

    res.json({
      success: true,
      message: 'Default feature flags berhasil diinisialisasi',
    });
  })
);

/**
 * @route GET /api/admin/config/features/enabled
 * @desc Get all enabled feature flags
 * @access Admin
 */
router.get(
  '/features/enabled',
  asyncHandler(async (req: Request, res: Response) => {
    const flags = await FeatureFlagService.getEnabledFlags();

    res.json({
      success: true,
       flags,
    });
  })
);

/**
 * @route POST /api/admin/config/features/check
 * @desc Check multiple feature flags
 * @access Admin
 */
router.post(
  '/features/check',
  asyncHandler(async (req: Request, res: Response) => {
    const { keys } = req.body;

    const result = await FeatureFlagService.checkFlags(keys);

    res.json({
      success: true,
       result,
    });
  })
);

export default router;
