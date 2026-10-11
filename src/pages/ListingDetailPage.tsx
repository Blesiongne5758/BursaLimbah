/**
 * BursaLimbah.com - Listing Detail Page
 * Detailed view of a waste listing with map, shipping, and booking options
 */

import { useState } from 'react';
import { useStore } from '../store';
import { MOCK_LISTINGS } from '../data';
import { WASTE_CATEGORIES } from '../types';
import { Card, Badge, Button, Alert, MapPlaceholder } from '../components/ui';
import { ShippingService } from '../services';
import { formatRupiah, formatNumber } from '../data';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Package, Shield, CreditCard, Lock, Star,
  ChevronRight, Truck, Award
} from 'lucide-react';

export default function ListingDetailPage() {
  const { selectedListingId, setPage, isAuthenticated } = useStore();
  const listing = MOCK_LISTINGS.find(l => l.id === selectedListingId) || MOCK_LISTINGS[0];
  const cat = WASTE_CATEGORIES[listing.category];

  const [showShipping, setShowShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const handleCheckShipping = async () => {
    setShowShipping(true);
    setLoadingShipping(true);
    const options = await ShippingService.getShippingCost({
      origin: listing.city,
      destination: 'Jakarta',
      weight: Math.min(listing.quantity, 100) * 1000,
    });
    setShippingOptions(options);
    setLoadingShipping(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => setPage('marketplace')}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700 mb-6"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Marketplace
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={listing.isB3 ? 'danger' : 'default'}>
                {cat.icon} {cat.label}
              </Badge>
              {listing.isB3 && <Badge variant="danger">☢️ B3</Badge>}
              {listing.priceTier === 'GOLD' && <Badge variant="warning">⭐ Premium</Badge>}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-4">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {listing.city}, {listing.province}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {listing.createdAt}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {formatNumber(listing.quantity)} {listing.unit}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Deskripsi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
            </div>
          </Card>

          {/* Map */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Lokasi
            </h3>
            <MapPlaceholder city={listing.city} province={listing.province} locked={true} />
            <Alert type="info" title="Lokasi Terproteksi">
              Alamat lengkap hanya dapat dilihat setelah booking dan pembayaran DP.
            </Alert>
          </Card>

          {/* Shipping Calculator */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" /> Estimasi Ongkir
              </h3>
              <Button variant="outline" size="sm" onClick={handleCheckShipping} loading={loadingShipping}>
                Hitung Ongkir
              </Button>
            </div>
            {showShipping && !loadingShipping && (
              <div className="space-y-2">
                {shippingOptions.map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {opt.courier} - {opt.service}
                      </p>
                      <p className="text-xs text-slate-500">Estimasi: {opt.estimate}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">{formatRupiah(opt.cost)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Seller Info */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Informasi Seller</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">{listing.sellerName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{listing.sellerName}</p>
                  {listing.sellerTier === 'CORPORATE' && <Shield className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-sm text-slate-500">
                  {listing.sellerTier === 'CORPORATE'
                    ? 'Corporate Member'
                    : listing.sellerTier === 'SMALL_BUSINESS'
                    ? 'Small Business'
                    : 'Personal'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-emerald-700">
                {formatRupiah(listing.pricePerKg || 0)}
              </p>
              <p className="text-sm text-slate-500">per {listing.unit}</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Total keseluruhan</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatRupiah((listing.pricePerKg || 0) * listing.quantity)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Button variant="primary" className="w-full" onClick={() => setPage('payment')}>
                    Mulai Negosiasi
                  </Button>
                  <Button variant="outline" className="w-full">
                    Chat Seller
                  </Button>
                </>
              ) : (
                <Button variant="primary" className="w-full" onClick={() => setPage('auth')}>
                  Masuk untuk Negosiasi
                </Button>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
              {[
                { Icon: Shield, text: 'Transaksi dilindungi escrow' },
                { Icon: CreditCard, text: 'DP 30% untuk booking' },
                { Icon: Lock, text: 'Lokasi terbuka setelah DP' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-600">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs">{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
