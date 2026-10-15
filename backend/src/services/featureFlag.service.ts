/**
 * Feature Flag Service
 * Admin configuration for enabling/disabling features
 */

import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError, NotFoundError } from '../utils/errors';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class FeatureFlagService {
  /**
   * Get all feature flags
   */
  static async getAllFlags(): Promise<FeatureFlag[]> {
    const cacheKey = 'feature_flags:all';
    const cached = await cache.get<FeatureFlag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { category: 'asc' },
    });

    await cache.set(cacheKey, flags, 300); // 5 minutes cache

    return flags;
  }

  /**
   * Get feature flag by key
   */
  static async getFlag(key: string): Promise<FeatureFlag | null> {
    const cacheKey = `feature_flag:${key}`;
    const cached = await cache.get<FeatureFlag>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (flag) {
      await cache.set(cacheKey, flag, 300);
    }

    return flag;
  }

  /**
   * Check if feature is enabled
   */
  static async isEnabled(key: string): Promise<boolean> {
    const flag = await this.getFlag(key);
    return flag?.enabled ?? false;
  }

  /**
   * Enable feature flag
   */
  static async enableFlag(key: string, adminId: string): Promise<FeatureFlag> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      throw new NotFoundError('Feature flag tidak ditemukan');
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
       { enabled: true },
    });

    // Invalidate cache
    await cache.del(`feature_flag:${key}`);
    await cache.del('feature_flags:all');

    // Log action
    await prisma.auditLog.create({
       {
        userId: adminId,
        action: 'FEATURE_FLAG_ENABLED',
        resource: 'FeatureFlag',
        resourceId: flag.id,
        metadata: { key, name: flag.name },
      },
    });

    logger.info(`Feature flag enabled: ${key} by admin ${adminId}`);

    return updated;
  }

  /**
   * Disable feature flag
   */
  static async disableFlag(key: string, adminId: string): Promise<FeatureFlag> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      throw new NotFoundError('Feature flag tidak ditemukan');
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
       { enabled: false },
    });

    // Invalidate cache
    await cache.del(`feature_flag:${key}`);
    await cache.del('feature_flags:all');

    // Log action
    await prisma.auditLog.create({
       {
        userId: adminId,
        action: 'FEATURE_FLAG_DISABLED',
        resource: 'FeatureFlag',
        resourceId: flag.id,
        metadata: { key, name: flag.name },
      },
    });

    logger.info(`Feature flag disabled: ${key} by admin ${adminId}`);

    return updated;
  }

  /**
   * Update feature flag metadata
   */
  static async updateFlagMetadata(
    key: string,
    metadata: any,
    adminId: string
  ): Promise<FeatureFlag> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      throw new NotFoundError('Feature flag tidak ditemukan');
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
       { metadata },
    });

    // Invalidate cache
    await cache.del(`feature_flag:${key}`);
    await cache.del('feature_flags:all');

    // Log action
    await prisma.auditLog.create({
       {
        userId: adminId,
        action: 'FEATURE_FLAG_UPDATED',
        resource: 'FeatureFlag',
        resourceId: flag.id,
        metadata: { key, changes: metadata },
      },
    });

    logger.info(`Feature flag updated: ${key} by admin ${adminId}`);

    return updated;
  }

  /**
   * Get flags by category
   */
  static async getFlagsByCategory(category: string): Promise<FeatureFlag[]> {
    const cacheKey = `feature_flags:category:${category}`;
    const cached = await cache.get<FeatureFlag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const flags = await prisma.featureFlag.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });

    await cache.set(cacheKey, flags, 300);

    return flags;
  }

  /**
   * Get enabled flags
   */
  static async getEnabledFlags(): Promise<FeatureFlag[]> {
    const cacheKey = 'feature_flags:enabled';
    const cached = await cache.get<FeatureFlag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const flags = await prisma.featureFlag.findMany({
      where: { enabled: true },
      orderBy: { category: 'asc' },
    });

    await cache.set(cacheKey, flags, 300);

    return flags;
  }

  /**
   * Check multiple flags at once
   */
  static async checkFlags(keys: string[]): Promise<Record<string, boolean>> {
    const flags = await prisma.featureFlag.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, boolean> = {};
    keys.forEach(key => {
      const flag = flags.find(f => f.key === key);
      result[key] = flag?.enabled ?? false;
    });

    return result;
  }

  /**
   * Initialize default feature flags
   */
  static async initializeDefaults(): Promise<void> {
    const defaultFlags = [
      // Core Features
      { key: 'marketplace_enabled', name: 'Marketplace', description: 'Aktifkan fitur marketplace', category: 'core', enabled: true },
      { key: 'ai_chat_enabled', name: 'AI Chat Assistant', description: 'Aktifkan asisten AI', category: 'core', enabled: true },
      { key: 'escrow_payment_enabled', name: 'Escrow Payment', description: 'Aktifkan sistem escrow', category: 'core', enabled: true },
      
      // Payment Methods
      { key: 'midtrans_enabled', name: 'Midtrans', description: 'Aktifkan Midtrans payment', category: 'payment', enabled: true },
      { key: 'crypto_payment_enabled', name: 'Crypto Payment', description: 'Aktifkan pembayaran crypto', category: 'payment', enabled: false },
      { key: 'bank_transfer_enabled', name: 'Bank Transfer', description: 'Aktifkan transfer bank', category: 'payment', enabled: true },
      
      // KYC Features
      { key: 'kyc_ktp_enabled', name: 'KYC KTP', description: 'Aktifkan verifikasi KTP', category: 'kyc', enabled: true },
      { key: 'kyc_npwp_enabled', name: 'KYC NPWP', description: 'Aktifkan verifikasi NPWP', category: 'kyc', enabled: true },
      { key: 'kyc_nib_enabled', name: 'KYC NIB', description: 'Aktifkan verifikasi NIB', category: 'kyc', enabled: true },
      
      // Shipping
      { key: 'shipping_enabled', name: 'Shipping Calculator', description: 'Aktifkan kalkulator ongkir', category: 'shipping', enabled: true },
      { key: 'tracking_enabled', name: 'Shipment Tracking', description: 'Aktifkan tracking pengiriman', category: 'shipping', enabled: true },
      
      // Advanced Features
      { key: 'bulk_upload_enabled', name: 'Bulk Upload', description: 'Aktifkan upload massal', category: 'advanced', enabled: false },
      { key: 'api_access_enabled', name: 'API Access', description: 'Aktifkan akses API publik', category: 'advanced', enabled: false },
      { key: 'priority_listing_enabled', name: 'Priority Listing', description: 'Aktifkan listing prioritas', category: 'advanced', enabled: true },
      
      // Blockchain
      { key: 'blockchain_wallet_enabled', name: 'Blockchain Wallet', description: 'Aktifkan wallet crypto', category: 'blockchain', enabled: false },
      { key: 'crypto_distribution_enabled', name: 'Crypto Distribution', description: 'Aktifkan distribusi token', category: 'blockchain', enabled: false },
      { key: 'nft_listing_enabled', name: 'NFT Listing', description: 'Aktifkan listing sebagai NFT', category: 'blockchain', enabled: false },
      
      // Communication
      { key: 'email_notifications_enabled', name: 'Email Notifications', description: 'Aktifkan notifikasi email', category: 'communication', enabled: true },
      { key: 'push_notifications_enabled', name: 'Push Notifications', description: 'Aktifkan push notification', category: 'communication', enabled: true },
      { key: 'sms_notifications_enabled', name: 'SMS Notifications', description: 'Aktifkan notifikasi SMS', category: 'communication', enabled: false },
      
      // Analytics
      { key: 'analytics_enabled', name: 'Analytics', description: 'Aktifkan tracking analytics', category: 'analytics', enabled: true },
      { key: 'reporting_enabled', name: 'Reporting', description: 'Aktifkan fitur reporting', category: 'analytics', enabled: true },
    ];

    for (const flag of defaultFlags) {
      await prisma.featureFlag.upsert({
        where: { key: flag.key },
        update: {},
        create: flag,
      });
    }

    logger.info('Default feature flags initialized');
  }
}

export default FeatureFlagService;
