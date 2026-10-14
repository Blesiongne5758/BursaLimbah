/**
 * BursaLimbah.com - Admin Page
 * Admin dashboard for platform management
 */

import { useStore } from '../store';
import { MOCK_LISTINGS, MOCK_USERS } from '../data';
import { Card, Badge, Button } from '../components/ui';
import { motion } from 'framer-motion';
import { AlertCircle, Users, Package, TrendingUp, ShieldCheck, Settings } from 'lucide-react';

export default function AdminPage() {
  const { setPage } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-600">Kelola platform BursaLimbah</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage('admin-config')}>
            <Settings className="w-4 h-4" /> Konfigurasi
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage('schema')}>
            <Package className="w-4 h-4" /> Schema Database
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total User', value: '2,847', change: '+124 minggu ini', color: 'emerald' },
          { title: 'Listing Aktif', value: '12,543', change: '18 perlu moderasi', color: 'amber' },
          { title: 'Transaksi Hari Ini', value: '87', change: '+15% dari kemarin', color: 'blue' },
          { title: 'Revenue', value: 'Rp 124 Jt', change: 'Bulan ini', color: 'purple' },
        ].map((s) => (
          <Card key={s.title} className="p-5">
            <p className="text-sm text-slate-600">{s.title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Moderation */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Listing Perlu Moderasi
          </h3>
          <div className="space-y-3">
            {MOCK_LISTINGS.filter((l) => l.isB3).map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-500">
                    {l.sellerName} • {l.city}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    Approve
                  </Button>
                  <Button variant="danger" size="sm">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Users */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> User Terbaru
          </h3>
          <div className="space-y-3">
            {MOCK_USERS.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-700">{u.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <Badge variant={u.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>
                  {u.kycStatus === 'VERIFIED' ? '✓ Verified' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
