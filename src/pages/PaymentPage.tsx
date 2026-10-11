/**
 * BursaLimbah.com - Payment Page
 * Payment flow with escrow system
 */

import { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Alert, ProgressStepper } from '../components/ui';
import { PaymentService } from '../services';
import { formatRupiah } from '../data';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function PaymentPage() {
  const { setPage } = useStore();
  const [step, setStep] = useState(0); // 0: review, 1: payment, 2: success
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    const result = await PaymentService.createTransaction({
      listingId: 'l1',
      quantity: 2000,
      pricePerKg: 4200,
      dpPercentage: 30,
    });
    setTxResult(result);
    setStep(1);
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    await PaymentService.verifyPayment(txResult.transactionId);
    setStep(2);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <ProgressStepper steps={['Review', 'Pembayaran', 'Konfirmasi']} currentStep={step} />

      <div className="mt-8">
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Review Pesanan</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">Limbah Plastik PP Grade A</p>
                  <p className="text-sm text-slate-500">Surabaya, Jawa Timur</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quantity</span>
                    <span className="font-medium">2.000 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harga/kg</span>
                    <span className="font-medium">{formatRupiah(4200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">{formatRupiah(8400000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Platform fee (2.5%)</span>
                    <span className="font-medium">{formatRupiah(210000)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-emerald-700">{formatRupiah(8610000)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-medium">DP (30%)</span>
                    <span className="font-bold">{formatRupiah(2520000)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setPage('marketplace')}>
                  Batal
                </Button>
                <Button variant="primary" className="flex-1" onClick={handlePayment} loading={loading}>
                  Lanjut ke Pembayaran
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Pembayaran DP</h2>
              <p className="text-sm text-slate-500 mb-6">Bayar DP 30% melalui Midtrans Snap</p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                <p className="text-sm font-medium text-amber-800">
                  Transaction ID: {txResult?.transactionId}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Berlaku hingga: {txResult ? new Date(txResult.expiryTime).toLocaleString('id-ID') : '-'}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-slate-700">Pilih Metode Pembayaran:</p>
                {['BCA Virtual Account', 'Mandiri Virtual Account', 'GoPay', 'ShopeePay', 'QRIS'].map(
                  (method) => (
                    <label
                      key={method}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-emerald-300 cursor-pointer"
                    >
                      <input type="radio" name="payment" className="text-emerald-600" defaultChecked={method === 'BCA Virtual Account'} />
                      <span className="text-sm text-slate-700">{method}</span>
                    </label>
                  )
                )}
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-6">
                <p className="text-sm font-medium text-emerald-800">
                  Total DP: {formatRupiah(txResult?.dpAmount || 0)}
                </p>
              </div>

              <Button variant="primary" className="w-full" onClick={handleVerify} loading={loading}>
                <CreditCard className="w-4 h-4" /> Bayar Sekarang
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h2>
              <p className="text-sm text-slate-600 mb-6">
                DP Anda telah diterima dan ditahan di escrow. Seller akan menyiapkan barang.
              </p>

              <div className="p-4 bg-slate-50 rounded-lg text-left mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono font-medium">ORD-{txResult?.transactionId?.split('-')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DP Dibayar</span>
                  <span className="font-medium text-emerald-700">{formatRupiah(txResult?.dpAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    PAID_DP
                  </span>
                </div>
              </div>

              <Alert type="info" title="Lokasi akan terbuka">
                Setelah seller mengkonfirmasi kesiapan, lokasi detail akan terbuka untuk Anda.
              </Alert>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setPage('dashboard')}>
                  Ke Dashboard
                </Button>
                <Button variant="primary" onClick={() => setPage('marketplace')}>
                  Lanjut Belanja
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
