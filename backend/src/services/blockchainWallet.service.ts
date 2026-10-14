/**
 * Blockchain Wallet Service
 * Crypto wallet management and transaction distribution
 */

import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';
import { config } from '../config';
import crypto from 'crypto';

// Mock blockchain client (in production, use web3.js or ethers.js)
interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

export class BlockchainWalletService {
  /**
   * Generate new wallet for user
   */
  static async generateWallet(userId: string): Promise<any> {
    // Check if user already has wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (existingWallet) {
      throw new AppError('User sudah memiliki wallet', 400);
    }

    // Generate wallet address and keys (mock implementation)
    // In production, use proper crypto library like ethers.js
    const walletAddress = `0x${crypto.randomBytes(20).toString('hex')}`;
    const privateKey = crypto.randomBytes(32).toString('hex');
    
    // Encrypt private key (in production, use proper encryption)
    const encryptedPrivateKey = await this.encryptPrivateKey(privateKey);

    const wallet = await prisma.wallet.create({
       {
        userId,
        address: walletAddress,
        encryptedPrivateKey,
        balance: 0,
        tokenBalance: 0,
      },
    });

    logger.info(`Wallet generated for user: ${userId}, address: ${walletAddress}`);

    return {
      address: wallet.address,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Get user wallet
   */
  static async getUserWallet(userId: string): Promise<any> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!wallet) {
      throw new NotFoundError('Wallet tidak ditemukan');
    }

    return {
      address: wallet.address,
      balance: wallet.balance,
      tokenBalance: wallet.tokenBalance,
      transactions: wallet.transactions,
    };
  }

  /**
   * Get wallet by address
   */
  static async getWalletByAddress(address: string): Promise<any> {
    const wallet = await prisma.wallet.findUnique({
      where: { address },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundError('Wallet tidak ditemukan');
    }

    return wallet;
  }

  /**
   * Deposit crypto to wallet
   */
  static async deposit(
    userId: string,
    amount: number,
    token: string = 'BLW',
    txHash?: string
  ): Promise<any> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundError('Wallet tidak ditemukan');
    }

    // Create transaction record
    const transaction = await prisma.walletTransaction.create({
       {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        token,
        txHash: txHash || `0x${crypto.randomBytes(32).toString('hex')}`,
        status: 'CONFIRMED',
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: wallet.address,
      },
    });

    // Update wallet balance
    const balanceField = token === 'BLW' ? 'tokenBalance' : 'balance';
    await prisma.wallet.update({
      where: { id: wallet.id },
       {
        [balanceField]: {
          increment: amount,
        },
      },
    });

    logger.info(`Deposit: ${amount} ${token} to wallet ${wallet.address}`);

    return transaction;
  }

  /**
   * Withdraw crypto from wallet
   */
  static async withdraw(
    userId: string,
    amount: number,
    toAddress: string,
    token: string = 'BLW'
  ): Promise<any> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundError('Wallet tidak ditemukan');
    }

    // Check balance
    const balanceField = token === 'BLW' ? 'tokenBalance' : 'balance';
    if (wallet[balanceField] < amount) {
      throw new AppError('Saldo tidak mencukupi', 400);
    }

    // Create transaction record
    const transaction = await prisma.walletTransaction.create({
       {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        token,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        status: 'PENDING',
        fromAddress: wallet.address,
        toAddress,
      },
    });

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
       {
        [balanceField]: {
          decrement: amount,
        },
      },
    });

    // In production, submit to blockchain and update status when confirmed
    // For now, mark as confirmed immediately
    await prisma.walletTransaction.update({
      where: { id: transaction.id },
       { status: 'CONFIRMED' },
    });

    logger.info(`Withdrawal: ${amount} ${token} from wallet ${wallet.address} to ${toAddress}`);

    return transaction;
  }

  /**
   * Distribute tokens to users (airdrop)
   */
  static async distributeTokens(
    adminId: string,
    recipients: Array<{ userId: string; amount: number }>,
    token: string = 'BLW'
  ): Promise<any> {
    const results = [];

    for (const recipient of recipients) {
      try {
        const wallet = await prisma.wallet.findUnique({
          where: { userId: recipient.userId },
        });

        if (!wallet) {
          results.push({
            userId: recipient.userId,
            status: 'FAILED',
            error: 'Wallet tidak ditemukan',
          });
          continue;
        }

        // Create transaction
        const transaction = await prisma.walletTransaction.create({
           {
            walletId: wallet.id,
            type: 'DISTRIBUTION',
            amount: recipient.amount,
            token,
            txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
            status: 'CONFIRMED',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: wallet.address,
            metadata: { distributedBy: adminId },
          },
        });

        // Update wallet balance
        await prisma.wallet.update({
          where: { id: wallet.id },
           {
            tokenBalance: {
              increment: recipient.amount,
            },
          },
        });

        results.push({
          userId: recipient.userId,
          status: 'SUCCESS',
          transactionId: transaction.id,
        });

        logger.info(`Distributed ${recipient.amount} ${token} to user ${recipient.userId}`);
      } catch (error) {
        results.push({
          userId: recipient.userId,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log distribution
    await prisma.auditLog.create({
       {
        userId: adminId,
        action: 'TOKEN_DISTRIBUTION',
        resource: 'Wallet',
        metadata: { recipients: recipients.length, token, results },
      },
    });

    return {
      totalRecipients: recipients.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      results,
    };
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundError('Wallet tidak ditemukan');
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all wallets (admin only)
   */
  static async getAllWallets(): Promise<any> {
    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return wallets;
  }

  /**
   * Get wallet statistics
   */
  static async getWalletStats(): Promise<any> {
    const [totalWallets, totalBalance, totalTokenBalance, totalTransactions] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
      prisma.wallet.aggregate({
        _sum: { tokenBalance: true },
      }),
      prisma.walletTransaction.count(),
    ]);

    return {
      totalWallets,
      totalBalance: totalBalance._sum.balance || 0,
      totalTokenBalance: totalTokenBalance._sum.tokenBalance || 0,
      totalTransactions,
    };
  }

  /**
   * Encrypt private key
   */
  private static async encryptPrivateKey(privateKey: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(config.encryption.locationKey || crypto.randomBytes(32).toString('hex'), 'hex');

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt private key
   */
  private static async decryptPrivateKey(encrypted: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      throw new AppError('Invalid encrypted data', 500);
    }

    const [ivHex, authTagHex, encryptedData] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = Buffer.from(config.encryption.locationKey || crypto.randomBytes(32).toString('hex'), 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export default BlockchainWalletService;
