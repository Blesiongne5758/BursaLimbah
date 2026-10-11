/**
 * BursaLimbah.com - Pricing Page
 * Membership tiers and feature comparison
 */

import { useStore } from '../store';
import { Card, Badge, Button } from '../components/ui';
import { motion } from 'framer-motion';
import { Check, User, Building2, Globe, Award } from 'lucide-react';

export default function PricingPage() {
  const { setPage } = useStore();

  const plans = [
    {
      name: 'Personal',
      price: 'Gratis',
      desc: 'Untuk individu dan pemula',
      features: [
        '5 listing aktif',
        '20 negosiasi/bulan',
        'AI Chat (basic)',
        'Escrow protection',
        'Rating & review',
      ],
      cta: 'Mulai Gratis',
      highlighted: false,
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Small Business',
      price: 'Rp 299.000',
      period: '/bulan',
      desc: 'Untuk UMKM dan pengepul',
      features: [
        '25 listing aktif',
        '100 negosiasi/bulan',
        'AI Chat (full)',
        'Riwayat buyer/seller',
        'Bulk upload',
        'Export laporan PDF/Excel',
        'Priority support',
      ],
      cta: 'Pilih Bisnis',
      highlighted: true,
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Corporate',
      price: 'Rp 999.000',
      period: '/bulan',
      desc: 'Untuk perusahaan & industri',
      features: [
        'Unlimited listing',
        'Unlimited negosiasi',
        'AI Chat + custom prompts',
        'Priority listing placement',
        'Dedicated account manager',
        'API access',
        'Custom SLA escrow',
        'Price tier Gold visible',
        'PPh 23 support',
      ],
      cta: 'Hubungi Sales',
      highlighted: false,
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Paket Membership
        </h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
          Pilih paket yang sesuai dengan skala bisnis Anda. Upgrade kapan saja untuk membuka fitur lebih lengkap.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 ${
              plan.highlighted
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 scale-105 shadow-xl'
                : 'bg-white border border-slate-200'
            }`}
          >
            {plan.highlighted && (
              <div className="text-center mb-4">
                <Badge variant="warning" size="md">
                  <Award className="w-3 h-3 mr-1" /> POPULER
                </Badge>
              </div>
            )}

            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                plan.highlighted ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {plan.icon}
            </div>

            <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            <p className={`text-sm mt-1 ${plan.highlighted ? 'text-emerald-100' : 'text-slate-500'}`}>
              {plan.desc}
            </p>

            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className={`text-sm ${plan.highlighted ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              )}
            </div>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlighted ? 'text-emerald-200' : 'text-emerald-600'
                    }`}
                  />
                  <span className={plan.highlighted ? 'text-emerald-50' : 'text-slate-700'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? 'secondary' : 'primary'}
              className="w-full"
              onClick={() => setPage('auth')}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-center text-slate-900 mb-8">
          Perbandingan Fitur
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Fitur</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Personal</th>
                  <th className="text-center px-4 py-3 font-medium text-emerald-600">Bisnis</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Corporate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Max Listing', '5', '25', 'Unlimited'],
                  ['AI Chat', 'Basic', 'Full', 'Full + Custom'],
                  ['Riwayat Transaksi', '❌', '✅', '✅'],
                  ['Bulk Upload', '❌', '✅', '✅'],
                  ['Export Laporan', '❌', '✅', '✅'],
                  ['Priority Listing', '❌', '❌', '✅'],
                  ['API Access', '❌', '❌', '✅'],
                  ['Dedicated Manager', '❌', '❌', '✅'],
                ].map(([feature, personal, business, corporate]) => (
                  <tr key={feature} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{feature}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{personal}</td>
                    <td className="px-4 py-3 text-center text-emerald-700 font-medium">
                      {business}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{corporate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-center text-slate-900 mb-8">
          Pertanyaan Umum
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Apakah bisa upgrade/downgrade paket kapan saja?',
              a: 'Ya, Anda bisa upgrade atau downgrade paket kapan saja. Perubahan akan berlaku di periode billing berikutnya.',
            },
            {
              q: 'Bagaimana sistem escrow bekerja?',
              a: 'Dana pembeli ditahan di escrow hingga barang diterima dan divalidasi. Setelah validasi, dana akan di-release ke seller (minus platform fee).',
            },
            {
              q: 'Apakah ada biaya tersembunyi?',
              a: 'Tidak ada biaya tersembunyi. Platform fee 2-5% sudah termasuk dalam setiap transaksi.',
            },
            {
              q: 'Bagaimana jika terjadi sengketa?',
              a: 'Tim kami akan memediasi sengketa dalam 3x24 jam. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui BAPSI.',
            },
          ].map((faq) => (
            <Card key={faq.q} className="p-5">
              <h3 className="font-medium text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
