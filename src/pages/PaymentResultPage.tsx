/**
 * BursaLimbah.com - Payment Result Page
 * Handles payment success, failed, pending, and expired states
 * Redirected from Midtrans payment gateway
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Badge, Alert } from '../components/ui';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Download, ArrowRight, Package, Calendar,
  CreditCard, MapPin, Phone, Mail, Share2
} from 'lucide-react';
import { formatRupiah } from '../data';

type PaymentStatus = 'success' | 'failed' | 'pending' | 'expired' | 'unknown';

interface PaymentDetails {
  orderId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  listingTitle?: string;
  quantity?: number;
  buyerName?: string;
  buyerEmail?: string;
  timestamp: string;
}

export default function PaymentResultPage() {
  const { setPage } = useStore();
  const [status, setStatus] = useState<PaymentStatus>('unknown');
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters from Midtrans redirect
    const urlParams = new URLSearchParams(window.location.search);
    const resultType = urlParams.get('result_type') || urlParams.get('transaction_status');
    const orderId = urlParams.get('order_id') || urlParams.get('id');
    const statusCode = urlParams.get('status_code');

    // Determine payment status
    if (resultType === 'success' || statusCode === '200' || resultType === 'settlement' || resultType === 'capture') {
      setStatus('success');
    } else if (resultType === 'failure' || resultType === 'deny' || statusCode === '202') {
      setStatus('failed');
    } else if (resultType === 'pending' || statusCode === '201') {
      setStatus('pending');
    } else if (resultType === 'expire' || resultType === 'expired') {
      setStatus('expired');
    } else {
      setStatus('unknown');
    }

    // Mock payment details (in production, fetch from backend)
    setDetails({
      orderId: orderId || `ORD-${Date.now()}`,
      transactionId: `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      amount: 2520000,
      paymentMethod: 'BCA Virtual Account',
      listingTitle: 'Limbah Plastik PP Grade A - 5 Ton',
      quantity: 2000,
      buyerName: 'Budi Santoso',
      buyerEmail: 'budi@example.com',
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pembayaran BursaLimbah',
        text: `Pembayaran ${status === 'success' ? 'berhasil' : 'gagal'} di BursaLimbah.com`,
        url: window.location.href,
      });
    }
  };

  const handleDownloadReceipt = () => {
    // Generate receipt (mock)
    alert('Struk pembayaran akan diunduh...');
  };

  // SEO configuration based on status
  const seoConfig = {
    success: {
      title: 'Pembayaran Berhasil - BursaLimbah',
      description: 'Pembayaran Anda telah berhasil diproses. Dana akan ditahan di escrow hingga barang diterima dan divalidasi.',
    },
    failed: {
      title: 'Pembayaran Gagal - BursaLimbah',
      description: 'Pembayaran Anda tidak berhasil diproses. Silakan coba lagi atau hubungi customer service.',
    },
    pending: {
      title: 'Pembayaran Pending - BursaLimbah',
      description: 'Pembayaran Anda sedang diproses. Kami akan memberitahu Anda setelah pembayaran dikonfirmasi.',
    },
    expired: {
      title: 'Pembayaran Kadaluarsa - BursaLimbah',
      description: 'Pembayaran Anda telah kadaluarsa. Silakan buat transaksi baru.',
    },
    unknown: {
      title: 'Status Pembayaran - BursaLimbah',
      description: 'Cek status pembayaran Anda di BursaLimbah.com',
    },
  };

  const currentSeo = seoConfig[status];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={currentSeo.title}
        description={currentSeo.description}
        keywords={['pembayaran', 'transaksi', 'escrow', 'limbah', 'bursalimbah']}
        url={`https://bursalimbah.com/payment/result?status=${status}`}
        noindex={status !== 'success'}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Icon & Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                Pembayaran Berhasil!
              </h1>
              <p className="text-slate-600">
                Terima kasih! Pembayaran Anda telah berhasil diproses.
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                Pembayaran Gagal
              </h1>
              <p className="text-slate-600">
                Maaf, pembayaran Anda tidak berhasil diproses.
              </p>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-12 h-12 text-amber-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                Pembayaran Sedang Diproses
              </h1>
              <p className="text-slate-600">
                Pembayaran Anda sedang diverifikasi. Mohon tunggu.
              </p>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-slate-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                Pembayaran Kadaluarsa
              </h1>
              <p className="text-slate-600">
                Pembayaran Anda telah kadaluarsa. Silakan buat transaksi baru.
              </p>
            </>
          )}

          {status === 'unknown' && (
            <>
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-slate-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                Status Tidak Diketahui
              </h1>
              <p className="text-slate-600">
                Kami tidak dapat memverifikasi status pembayaran Anda.
              </p>
            </>
          )}
        </motion.div>

        {/* Transaction Details Card */}
        {details && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Detail Transaksi
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Order ID</span>
                  <span className="text-sm font-mono font-medium text-slate-900">
                    {details.orderId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Transaction ID</span>
                  <span className="text-sm font-mono font-medium text-slate-900">
                    {details.transactionId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatRupiah(details.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Payment Method</span>
                  <span className="text-sm font-medium text-slate-900">
                    {details.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge
                    variant={
                      status === 'success' ? 'success' :
                      status === 'failed' ? 'danger' :
                      status === 'pending' ? 'warning' : 'default'
                    }
                    size="md"
                  >
                    {status === 'success' && 'Berhasil'}
                    {status === 'failed' && 'Gagal'}
                    {status === 'pending' && 'Pending'}
                    {status === 'expired' && 'Kadaluarsa'}
                    {status === 'unknown' && 'Unknown'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Tanggal</span>
                  <span className="text-sm text-slate-900">
                    {new Date(details.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Listing Details (if success) */}
            {status === 'success' && details.listingTitle && (
              <Card className="p-6 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Detail Pesanan
                </h2>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">
                      {details.listingTitle}
                    </p>
                    {details.quantity && (
                      <p className="text-xs text-slate-500 mt-1">
                        Quantity: {details.quantity.toLocaleString('id-ID')} kg
                      </p>
                    )}
                  </div>

                  <Alert type="info" title="Lokasi akan terbuka">
                    <p className="text-sm">
                      Setelah seller mengkonfirmasi kesiapan, lokasi detail pengambilan akan terbuka untuk Anda.
                    </p>
                  </Alert>
                </div>
              </Card>
            )}

            {/* Next Steps */}
            {status === 'success' && (
              <Card className="p-6 mb-6 bg-emerald-50 border-emerald-200">
                <h2 className="font-semibold text-emerald-900 mb-4">
                  📋 Langkah Selanjutnya
                </h2>
                <ol className="space-y-3 text-sm text-emerald-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Seller akan menyiapkan barang sesuai pesanan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Anda akan menerima notifikasi email dengan detail lokasi pengambilan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Ambil barang di lokasi yang ditentukan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Validasi barang yang diterima</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>Dana akan di-release ke seller setelah validasi</span>
                  </li>
                </ol>
              </Card>
            )}

            {/* Failed/Pending Actions */}
            {(status === 'failed' || status === 'expired') && (
              <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
                <h2 className="font-semibold text-amber-900 mb-4">
                  💡 Apa yang bisa Anda lakukan?
                </h2>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Coba lagi dengan metode pembayaran berbeda</li>
                  <li>• Pastikan saldo cukup untuk transaksi</li>
                  <li>• Periksa koneksi internet Anda</li>
                  <li>• Hubungi customer service jika masalah berlanjut</li>
                </ul>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {status === 'success' && (
                <>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => setPage('dashboard')}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Ke Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownloadReceipt}
                  >
                    <Download className="w-4 h-4" />
                    Unduh Struk
                  </Button>
                </>
              )}

              {(status === 'failed' || status === 'expired') && (
                <>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => setPage('marketplace')}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Coba Lagi
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPage('dashboard')}
                  >
                    Ke Dashboard
                  </Button>
                </>
              )}

              {status === 'pending' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setPage('dashboard')}
                >
                  <ArrowRight className="w-4 h-4" />
                  Ke Dashboard
                </Button>
              )}
            </div>

            {/* Share & Contact */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Bagikan
              </button>

              <div className="flex items-center gap-4 text-sm text-slate-600">
                <a
                  href="mailto:support@bursalimbah.com"
                  className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                <a
                  href="tel:+622155550000"
                  className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-500 mb-3">Transaksi Anda dilindungi oleh:</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              🔒 Escrow Payment
            </span>
            <span className="flex items-center gap-1">
              ✅ UU PDP Compliant
            </span>
            <span className="flex items-center gap-1">
              🛡️ Midtrans Verified
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
