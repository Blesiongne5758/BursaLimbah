/**
 * Admin Configuration Page
 * Feature flag management interface
 */

import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button, Alert } from '../components/ui';
import { motion } from 'framer-motion';
import { Settings, ToggleLeft, ToggleRight, RefreshCw, Save } from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  metadata?: any;
}

export default function AdminConfigPage() {
  const { currentUser } = useStore();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockFlags: FeatureFlag[] = [
        // Core Features
        { id: '1', key: 'marketplace_enabled', name: 'Marketplace', description: 'Aktifkan fitur marketplace', enabled: true, category: 'core' },
        { id: '2', key: 'ai_chat_enabled', name: 'AI Chat Assistant', description: 'Aktifkan asisten AI', enabled: true, category: 'core' },
        { id: '3', key: 'escrow_payment_enabled', name: 'Escrow Payment', description: 'Aktifkan sistem escrow', enabled: true, category: 'core' },
        
        // Payment Methods
        { id: '4', key: 'midtrans_enabled', name: 'Midtrans', description: 'Aktifkan Midtrans payment', enabled: true, category: 'payment' },
        { id: '5', key: 'crypto_payment_enabled', name: 'Crypto Payment', description: 'Aktifkan pembayaran crypto', enabled: false, category: 'payment' },
        { id: '6', key: 'bank_transfer_enabled', name: 'Bank Transfer', description: 'Aktifkan transfer bank', enabled: true, category: 'payment' },
        
        // KYC Features
        { id: '7', key: 'kyc_ktp_enabled', name: 'KYC KTP', description: 'Aktifkan verifikasi KTP', enabled: true, category: 'kyc' },
        { id: '8', key: 'kyc_npwp_enabled', name: 'KYC NPWP', description: 'Aktifkan verifikasi NPWP', enabled: true, category: 'kyc' },
        { id: '9', key: 'kyc_nib_enabled', name: 'KYC NIB', description: 'Aktifkan verifikasi NIB', enabled: true, category: 'kyc' },
        
        // Shipping
        { id: '10', key: 'shipping_enabled', name: 'Shipping Calculator', description: 'Aktifkan kalkulator ongkir', enabled: true, category: 'shipping' },
        { id: '11', key: 'tracking_enabled', name: 'Shipment Tracking', description: 'Aktifkan tracking pengiriman', enabled: true, category: 'shipping' },
        
        // Advanced Features
        { id: '12', key: 'bulk_upload_enabled', name: 'Bulk Upload', description: 'Aktifkan upload massal', enabled: false, category: 'advanced' },
        { id: '13', key: 'api_access_enabled', name: 'API Access', description: 'Aktifkan akses API publik', enabled: false, category: 'advanced' },
        { id: '14', key: 'priority_listing_enabled', name: 'Priority Listing', description: 'Aktifkan listing prioritas', enabled: true, category: 'advanced' },
        
        // Blockchain
        { id: '15', key: 'blockchain_wallet_enabled', name: 'Blockchain Wallet', description: 'Aktifkan wallet crypto', enabled: false, category: 'blockchain' },
        { id: '16', key: 'crypto_distribution_enabled', name: 'Crypto Distribution', description: 'Aktifkan distribusi token', enabled: false, category: 'blockchain' },
        { id: '17', key: 'nft_listing_enabled', name: 'NFT Listing', description: 'Aktifkan listing sebagai NFT', enabled: false, category: 'blockchain' },
        
        // Communication
        { id: '18', key: 'email_notifications_enabled', name: 'Email Notifications', description: 'Aktifkan notifikasi email', enabled: true, category: 'communication' },
        { id: '19', key: 'push_notifications_enabled', name: 'Push Notifications', description: 'Aktifkan push notification', enabled: true, category: 'communication' },
        { id: '20', key: 'sms_notifications_enabled', name: 'SMS Notifications', description: 'Aktifkan notifikasi SMS', enabled: false, category: 'communication' },
        
        // Analytics
        { id: '21', key: 'analytics_enabled', name: 'Analytics', description: 'Aktifkan tracking analytics', enabled: true, category: 'analytics' },
        { id: '22', key: 'reporting_enabled', name: 'Reporting', description: 'Aktifkan fitur reporting', enabled: true, category: 'analytics' },
      ];

      setFlags(mockFlags);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memuat feature flags' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    setSaving(flag.key);
    try {
      // Mock API call - in production, call actual API
      await new Promise(resolve => setTimeout(resolve, 500));

      setFlags(prev => prev.map(f => 
        f.key === flag.key ? { ...f, enabled: !f.enabled } : f
      ));

      setMessage({
        type: 'success',
        text: `Feature flag "${flag.name}" berhasil ${flag.enabled ? 'dinonaktifkan' : 'diaktifkan'}`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengubah feature flag' });
    } finally {
      setSaving(null);
    }
  };

  const categories = Array.from(new Set(flags.map(f => f.category)));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-slate-600">Memuat konfigurasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-emerald-600" />
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Konfigurasi Admin
          </h1>
        </div>
        <p className="text-slate-600">
          Kelola feature flags dan konfigurasi sistem
        </p>
      </div>

      {/* Message */}
      {message && (
        <Alert type={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-sm text-slate-600">Total Features</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{flags.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-600">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {flags.filter(f => f.enabled).length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-600">Inactive</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">
            {flags.filter(f => !f.enabled).length}
          </p>
        </Card>
      </div>

      {/* Feature Flags by Category */}
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category}>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 capitalize">
              {category}
            </h2>
            <div className="grid gap-4">
              {flags
                .filter(f => f.category === category)
                .map(flag => (
                  <motion.div
                    key={flag.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {flag.name}
                            </h3>
                            <Badge variant={flag.enabled ? 'success' : 'default'}>
                              {flag.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            {flag.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">
                            {flag.key}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFlag(flag)}
                          disabled={saving === flag.key}
                          className="ml-4"
                        >
                          {saving === flag.key ? (
                            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                          ) : flag.enabled ? (
                            <ToggleRight className="w-12 h-12 text-emerald-600 hover:text-emerald-700 transition-colors" />
                          ) : (
                            <ToggleLeft className="w-12 h-12 text-slate-400 hover:text-slate-600 transition-colors" />
                          )}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={loadFeatureFlags}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
