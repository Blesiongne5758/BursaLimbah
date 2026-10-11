/**
 * BursaLimbah.com - Marketplace Page
 * Browse listings with filters and search
 */

import { useState } from 'react';
import { useStore } from '../store';
import { Card, Badge } from '../components/ui';
import { ListingGridSkeleton } from '../components/Skeleton';
import { useFilteredListings } from '../hooks';
import { WASTE_CATEGORIES, TRANSACTION_STATUS_COLORS, type WasteCategory, type Listing } from '../types';
import { formatRupiah, formatNumber } from '../data';
import { motion } from 'framer-motion';
import { Search, MapPin, Award, ShieldCheck, Star } from 'lucide-react';

export default function MarketplacePage() {
  const { setPage, setSelectedListing } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [isLoading, setIsLoading] = useState(false);

  const { filteredListings, total } = useFilteredListings(searchQuery, selectedCategory, sortBy);

  const handleCategoryChange = (category: WasteCategory | 'ALL') => {
    setIsLoading(true);
    setSelectedCategory(category);
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari limbah... (plastik PP, aluminium, kertas)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="newest">Terbaru</option>
            <option value="price_low">Harga Terendah</option>
            <option value="price_high">Harga Tertinggi</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <CategoryPill active={selectedCategory === 'ALL'} onClick={() => handleCategoryChange('ALL')}>
            Semua
          </CategoryPill>
          {(Object.entries(WASTE_CATEGORIES) as [WasteCategory, typeof WASTE_CATEGORIES[WasteCategory]][]).map(([key, cat]) => (
            <CategoryPill key={key} active={selectedCategory === key} onClick={() => handleCategoryChange(key)}>
              {cat.icon} {cat.label}
            </CategoryPill>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{total}</span> listing ditemukan
        </p>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <ListingGridSkeleton count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => {
                setSelectedListing(listing.id);
                setPage('listing-detail');
              }}
            />
          ))}
        </div>
      )}

      {filteredListings.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">Tidak ada listing ditemukan</h3>
          <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
        active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
      }`}
    >
      {children}
    </button>
  );
}

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const cat = WASTE_CATEGORIES[listing.category];
  const status = TRANSACTION_STATUS_COLORS[listing.status];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all text-left overflow-hidden group"
    >
      <div className="h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
        <span className="text-4xl">{cat.icon}</span>
        {listing.isB3 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">B3</span>
        )}
        {listing.priceTier === 'GOLD' && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full flex items-center gap-0.5">
            <Award className="w-2.5 h-2.5" />Premium
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors mb-2">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{listing.city}, {listing.province}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-emerald-700">
              {formatRupiah(listing.pricePerKg || 0)}
              <span className="text-xs font-normal text-slate-500">/{listing.unit}</span>
            </p>
            <p className="text-[11px] text-slate-500">{formatNumber(listing.quantity)} {listing.unit}</p>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-medium text-emerald-700">{listing.sellerName.charAt(0)}</span>
          </div>
          <span className="text-[11px] text-slate-600 flex-1 truncate">{listing.sellerName}</span>
          {listing.sellerTier === 'CORPORATE' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
        </div>
      </div>
    </motion.button>
  );
}
