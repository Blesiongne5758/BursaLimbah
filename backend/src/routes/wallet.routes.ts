/**
 * Blockchain Wallet Routes
 * Crypto wallet management and transactions
 */

import { Router, Request, Response } from 'express';
import { BlockchainWalletService } from '../services/blockchainWallet.service';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route POST /api/wallet/generate
 * @desc Generate new wallet for user
 * @access Private
 */
router.post(
  '/generate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const wallet = await BlockchainWalletService.generateWallet(req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Wallet berhasil dibuat',
       wallet,
    });
  })
);

/**
 * @route GET /api/wallet
 * @desc Get user wallet
 * @access Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const wallet = await BlockchainWalletService.getUserWallet(req.user!.id);

    res.json({
      success: true,
       wallet,
    });
  })
);

/**
 * @route GET /api/wallet/:address
 * @desc Get wallet by address
 * @access Public
 */
router.get(
  '/:address',
  asyncHandler(async (req: Request, res: Response) => {
    const wallet = await BlockchainWalletService.getWalletByAddress(req.params.address);

    res.json({
      success: true,
       wallet,
    });
  })
);

/**
 * @route POST /api/wallet/deposit
 * @desc Deposit crypto to wallet
 * @access Private
 */
router.post(
  '/deposit',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, token, txHash } = req.body;

    const transaction = await BlockchainWalletService.deposit(
      req.user!.id,
      amount,
      token,
      txHash
    );

    res.status(201).json({
      success: true,
      message: 'Deposit berhasil',
       transaction,
    });
  })
);

/**
 * @route POST /api/wallet/withdraw
 * @desc Withdraw crypto from wallet
 * @access Private
 */
router.post(
  '/withdraw',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, toAddress, token } = req.body;

    const transaction = await BlockchainWalletService.withdraw(
      req.user!.id,
      amount,
      toAddress,
      token
    );

    res.json({
      success: true,
      message: 'Withdrawal berhasil',
       transaction,
    });
  })
);

/**
 * @route GET /api/wallet/transactions
 * @desc Get transaction history
 * @access Private
 */
router.get(
  '/transactions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await BlockchainWalletService.getTransactionHistory(
      req.user!.id,
      page,
      limit
    );

    res.json({
      success: true,
       result,
    });
  })
);

/**
 * @route GET /api/wallet/admin/all
 * @desc Get all wallets (admin only)
 * @access Admin
 */
router.get(
  '/admin/all',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const wallets = await BlockchainWalletService.getAllWallets();

    res.json({
      success: true,
       wallets,
    });
  })
);

/**
 * @route GET /api/wallet/admin/stats
 * @desc Get wallet statistics (admin only)
 * @access Admin
 */
router.get(
  '/admin/stats',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await BlockchainWalletService.getWalletStats();

    res.json({
      success: true,
       stats,
    });
  })
);

/**
 * @route POST /api/wallet/admin/distribute
 * @desc Distribute tokens to users (admin only)
 * @access Admin
 */
router.post(
  '/admin/distribute',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { recipients, token } = req.body;

    const result = await BlockchainWalletService.distributeTokens(
      req.user!.id,
      recipients,
      token
    );

    res.json({
      success: true,
      message: 'Distribusi token berhasil',
       result,
    });
  })
);

export default router;
