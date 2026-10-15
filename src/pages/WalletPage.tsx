/**
 * Blockchain Wallet Page
 * Crypto wallet management and transactions
 */

import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button, Alert } from '../components/ui';
import { motion } from 'framer-motion';
import { Wallet, Send, Download, RefreshCw, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface WalletData {
  address: string;
  balance: number;
  tokenBalance: number;
  transactions: any[];
}

export default function WalletPage() {
  const { currentUser } = useStore();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockWallet: WalletData = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        balance: 1.5,
        tokenBalance: 10000,
        transactions: [
          {
            id: '1',
            type: 'DEPOSIT',
            amount: 5000,
            token: 'BLW',
            status: 'CONFIRMED',
            fromAddress: '0x000...000',
            toAddress: '0x742d...bEb',
            createdAt: '2024-11-20T10:00:00Z',
          },
          {
            id: '2',
            type: 'DISTRIBUTION',
            amount: 10000,
            token: 'BLW',
            status: 'CONFIRMED',
            fromAddress: '0x000...000',
            toAddress: '0x742d...bEb',
            createdAt: '2024-11-19T15:30:00Z',
          },
          {
            id: '3',
            type: 'WITHDRAWAL',
            amount: 5000,
            token: 'BLW',
            status: 'CONFIRMED',
            fromAddress: '0x742d...bEb',
            toAddress: '0xAbC...123',
            createdAt: '2024-11-18T09:15:00Z',
          },
        ],
      };

      setWallet(mockWallet);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memuat wallet' });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeposit = async (amount: number) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Deposit berhasil diproses' });
      setShowDeposit(false);
      loadWallet();
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memproses deposit' });
    }
  };

  const handleWithdraw = async (amount: number, toAddress: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Withdrawal berhasil diproses' });
      setShowWithdraw(false);
      loadWallet();
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memproses withdrawal' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-slate-600">Memuat wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">
            Wallet Belum Dibuat
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Buat wallet crypto untuk mulai bertransaksi
          </p>
          <Button variant="primary" onClick={loadWallet}>
            Buat Wallet
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Blockchain Wallet
          </h1>
        </div>
        <p className="text-slate-600">
          Kelola wallet crypto dan transaksi Anda
        </p>
      </div>

      {/* Message */}
      {message && (
        <Alert type={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Wallet Info */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Wallet Address */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Wallet Address</h3>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <code className="flex-1 text-sm text-slate-700 font-mono truncate">
              {wallet.address}
            </code>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Badge variant="success">Copied!</Badge>
              ) : (
                <Copy className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
          </div>
        </Card>

        {/* Balances */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Saldo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <div>
                <p className="text-sm text-emerald-700">BLW Token</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {wallet.tokenBalance.toLocaleString()} BLW
                </p>
              </div>
              <div className="text-4xl">🪙</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm text-slate-600">Native Balance</p>
                <p className="text-xl font-bold text-slate-900">
                  {wallet.balance} ETH
                </p>
              </div>
              <div className="text-3xl">💎</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => setShowDeposit(true)}
        >
          <Download className="w-5 h-5" />
          Deposit
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowWithdraw(true)}
        >
          <Send className="w-5 h-5" />
          Withdraw
        </Button>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {wallet.transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'DEPOSIT' || tx.type === 'DISTRIBUTION'
                    ? 'bg-emerald-100'
                    : 'bg-red-100'
                }`}>
                  {tx.type === 'DEPOSIT' || tx.type === 'DISTRIBUTION' ? (
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {tx.type === 'DEPOSIT' && 'Deposit'}
                    {tx.type === 'WITHDRAWAL' && 'Withdrawal'}
                    {tx.type === 'DISTRIBUTION' && 'Distribution'}
                    {tx.type === 'TRANSFER' && 'Transfer'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  tx.type === 'DEPOSIT' || tx.type === 'DISTRIBUTION'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}>
                  {tx.type === 'DEPOSIT' || tx.type === 'DISTRIBUTION' ? '+' : '-'}
                  {tx.amount.toLocaleString()} {tx.token}
                </p>
                <Badge variant={tx.status === 'CONFIRMED' ? 'success' : 'warning'}>
                  {tx.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
              Deposit BLW Token
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jumlah
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeposit(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleDeposit(1000)}
                >
                  Deposit
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
              Withdraw BLW Token
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jumlah
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Alamat Tujuan
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWithdraw(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleWithdraw(1000, '0x...')}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
