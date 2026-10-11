/**
 * BursaLimbah.com - Dashboard Page
 * User dashboard with overview, listings, bookings, wallet, reports
 */

import { useState } from 'react';
import { useStore, useFeatureGate } from '../store';
import { MOCK_LISTINGS, MOCK_TRANSACTIONS, formatRupiah, formatNumber } from '../data';
import { WASTE_CATEGORIES, TRANSACTION_STATUS_COLORS } from '../types';
import { Card, Badge, Button, StatCard, ProgressStepper } from '../components/ui';
import { motion } from 'framer-motion';
import {
  BarChart3, Package, Calendar, Wallet, FileText, Settings,
  TrendingUp, Star, Upload, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, setPage } = useStore();
  const featureGate = useFeatureGate();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'wallet' | 'reports' | 'settings'>('overview');

  if (!currentUser) return null;

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'listings', label: 'Listing', icon: <Package className="w-4 h-4" /> },
    { id: 'bookings', label: 'Booking', icon: <Calendar className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Selamat datang kembali, {currentUser.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              currentUser.membershipTier === 'CORPORATE'
                ? 'warning'
                : currentUser.membershipTier === 'SMALL_BUSINESS'
                ? 'success'
                : 'default'
            }
            size="md"
          >
            {currentUser.membershipTier === 'CORPORATE'
              ? '⭐ Corporate'
              : currentUser.membershipTier === 'SMALL_BUSINESS'
              ? '🟢 Bisnis'
              : '👤 Personal'}
          </Badge>
          {currentUser.kycStatus !== 'VERIFIED' && (
            <Badge variant="warning" size="md">
              KYC Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'listings' && <ListingsTab setPage={setPage} />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'wallet' && <WalletTab />}
      {activeTab === 'reports' && <ReportsTab featureGate={featureGate} />}
      {activeTab === 'settings' && <SettingsTab setPage={setPage} />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transaksi" value="12" change="+3 bulan ini" icon={<Package className="w-5 h-5" />} />
        <StatCard title="Pendapatan" value="Rp 24.5 Jt" change="+18% dari bulan lalu" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Listing Aktif" value="8" change="2 butuh review" icon={<FileText className="w-5 h-5" />} />
        <StatCard title="Rating" value="4.8/5.0" change="23 review" icon={<Star className="w-5 h-5" />} />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-3">
          {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{tx.listingTitle}</p>
                <p className="text-xs text-slate-500">
                  {tx.buyerName} → {tx.sellerName}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-slate-900">{formatRupiah(tx.totalPrice)}</p>
                <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'info'}>
                  {TRANSACTION_STATUS_COLORS[tx.status]?.label || tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ListingsTab({ setPage }: { setPage: (page: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{MOCK_LISTINGS.slice(0, 4).length} listing aktif</p>
        <Button variant="primary" size="sm">
          <Upload className="w-4 h-4" />
          Buat Listing
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Listing</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Harga</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LISTINGS.slice(0, 5).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{l.title}</p>
                    <p className="text-xs text-slate-500">{l.city}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge>
                      {WASTE_CATEGORIES[l.category].icon} {WASTE_CATEGORIES[l.category].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatRupiah(l.pricePerKg || 0)}/{l.unit}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        l.status === 'SOLD' ? 'success' : l.status === 'NEGOTIATING' ? 'warning' : 'info'
                      }
                    >
                      {TRANSACTION_STATUS_COLORS[l.status]?.label || l.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPage('listing-detail')}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                    >
                      Lihat →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BookingsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{MOCK_TRANSACTIONS.length} transaksi</p>
      {MOCK_TRANSACTIONS.map((tx) => (
        <Card key={tx.id} className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900">{tx.listingTitle}</p>
              <p className="text-sm text-slate-500 mt-1">
                {tx.buyerName} → {tx.sellerName}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {tx.estimatedPickup}
                </span>
                <span>{formatNumber(tx.quantity)} kg</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{formatRupiah(tx.totalPrice)}</p>
              <Badge
                variant={tx.status === 'COMPLETED' ? 'success' : 'info'}
                size="md"
              >
                {TRANSACTION_STATUS_COLORS[tx.status]?.label || tx.status}
              </Badge>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <ProgressStepper
              steps={['Book', 'DP', 'Pickup', 'Transit', 'Validasi', 'Selesai']}
              currentStep={tx.status === 'COMPLETED' ? 5 : tx.status === 'PAID_DP' ? 1 : 2}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

function WalletTab() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <p className="text-sm text-emerald-200">Saldo Tersedia</p>
          <p className="text-2xl font-bold mt-1">Rp 15.250.000</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 bg-white/20 text-white hover:bg-white/30 border-0"
          >
            Tarik Dana
          </Button>
        </div>
        <Card className="p-6">
          <p className="text-sm text-slate-600">Ditahan Escrow</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rp 5.145.000</p>
          <p className="text-xs text-slate-500 mt-1">2 transaksi aktif</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600">Total Pendapatan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rp 48.750.000</p>
          <p className="text-xs text-emerald-600 mt-1">+12% bulan ini</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {[
            { type: 'in', desc: 'Pembayaran dari PT Green Cycle', amount: 8400000, date: '16 Nov 2024' },
            { type: 'out', desc: 'Platform fee (2.5%)', amount: -210000, date: '16 Nov 2024' },
            { type: 'in', desc: 'Pembayaran dari Ahmad Wijaya', amount: 8750000, date: '12 Nov 2024' },
            { type: 'out', desc: 'Withdrawal ke BCA', amount: -10000000, date: '10 Nov 2024' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'in' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}
                >
                  {tx.type === 'in' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.desc}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}
                {formatRupiah(Math.abs(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReportsTab({ featureGate }: { featureGate: any }) {
  if (!featureGate.exportReports) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Fitur Laporan</h3>
        <p className="text-sm text-slate-500 mt-2 mb-4">
          Upgrade ke Small Business atau Corporate untuk mengakses laporan.
        </p>
        <Button variant="primary">Upgrade Sekarang</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Laporan</h3>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Penjualan Bulanan</h4>
          {[
            ['Nov 2024', 100, 'Rp 24.5 Jt'],
            ['Oct 2024', 74, 'Rp 18.2 Jt'],
            ['Sep 2024', 64, 'Rp 15.8 Jt'],
          ].map(([m, w, v]) => (
            <div key={m as string} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{m}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${w}%` }}></div>
                </div>
                <span className="text-xs font-medium text-slate-700 w-16 text-right">{v}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Kategori Terjual</h4>
          {[
            ['Plastik', 45, 'Rp 11.2 Jt'],
            ['Logam', 30, 'Rp 7.5 Jt'],
            ['Tekstil', 15, 'Rp 3.7 Jt'],
            ['Kertas', 10, 'Rp 2.1 Jt'],
          ].map(([c, w, v]) => (
            <div key={c as string} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{c}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${w}%` }}></div>
                </div>
                <span className="text-xs font-medium text-slate-700 w-16 text-right">{v}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function SettingsTab({ setPage }: { setPage: (page: any) => void }) {
  const { currentUser } = useStore();
  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Profil</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nama</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                defaultValue={currentUser.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Telepon</label>
              <input
                type="tel"
                defaultValue={currentUser.phone}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kota</label>
              <input
                type="text"
                defaultValue={currentUser.city}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <Button variant="primary" size="sm">
            Simpan Perubahan
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Verifikasi KYC</h3>
        <p className="text-sm text-slate-600 mb-4">
          Status:{' '}
          <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>
            {currentUser.kycStatus}
          </Badge>
        </p>
        {currentUser.kycStatus !== 'VERIFIED' && (
          <Button variant="primary" size="sm" onClick={() => setPage('kyc')}>
            Mulai Verifikasi
          </Button>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Membership</h3>
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div>
            <p className="font-medium text-emerald-800">
              {currentUser.membershipTier === 'CORPORATE'
                ? 'Corporate'
                : currentUser.membershipTier === 'SMALL_BUSINESS'
                ? 'Small Business'
                : 'Personal'}
            </p>
            <p className="text-xs text-emerald-600">
              {currentUser.membershipTier === 'CORPORATE'
                ? 'Unlimited listing, API access, dedicated manager'
                : currentUser.membershipTier === 'SMALL_BUSINESS'
                ? '25 listing, AI full, export reports'
                : '5 listing, AI basic'}
            </p>
          </div>
          {currentUser.membershipTier !== 'CORPORATE' && (
            <Button variant="primary" size="sm" onClick={() => setPage('pricing')}>
              Upgrade
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
