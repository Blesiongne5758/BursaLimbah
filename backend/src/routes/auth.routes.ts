/**
 * Authentication Routes
 * User registration, login, and token management
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { loginSchema, registerSchema } from '../utils/validators';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);

    const user = await AuthService.register({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      phone: validatedData.phone,
      city: validatedData.city,
      province: validatedData.province,
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: user,
    });
  })
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);

    const result = await AuthService.login(
      validatedData.email,
      validatedData.password
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  })
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  })
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout berhasil',
    });
  })
);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getUserById(req.user!.id);

    res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * @route PUT /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.put(
  '/change-password',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(
      req.user!.id,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  })
);

export default router;
