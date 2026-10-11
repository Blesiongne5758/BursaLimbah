/**
 * BursaLimbah.com - Main Application
 * B2B & B2C Marketplace for waste trading in Indonesia
 * Architecture: Client → Services (Auth, Payment, AI, Shipping) → Data Layer
 * 
 * REFACTORING STATUS:
 * ✅ LandingPage - Extracted to src/pages/LandingPage.tsx
 * ✅ MarketplacePage - Extracted to src/pages/MarketplacePage.tsx
 * ✅ AuthPage - Extracted to src/pages/AuthPage.tsx
 * 🔄 Other pages - Still inline (will be extracted in next iteration)
 */

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useStore, useFeatureGate } from './store';
import { MOCK_LISTINGS, MOCK_TRANSACTIONS, formatRupiah, formatNumber } from './data';
import { WASTE_CATEGORIES, TRANSACTION_STATUS_COLORS, LISTING_STATUS_COLORS, PRISMA_SCHEMA, type WasteCategory, type Listing, type TransactionStatus } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Recycle, Search, MapPin, Shield, TrendingUp, Users, Star, ArrowRight,
  Menu, X, ChevronRight, Filter, MessageCircle, Bot, Send, Package,
  Wallet, BarChart3, Settings, LogOut, Bell, Check, AlertCircle,
  Lock, Eye, EyeOff, Upload, Sparkles, Globe, Building2, User,
  Phone, Mail, Calendar, Clock, Truck, CreditCard, FileText,
  ChevronDown, Zap, Award, Target, ShieldCheck, Scale, Leaf,
  ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink, Copy,
  CheckCircle2, XCircle, Loader2, Layers, Database, Cloud, Cpu
} from 'lucide-react';
import { Card, Badge, Button, Alert, ProgressStepper, MapPlaceholder, TransactionTimeline, StatCard, EmptyState, Skeleton } from './components/ui';
import { AuthService, PaymentService, ShippingService, AIAgentService, LocationService, KYCService } from './services';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SEO, PreloadResources, Analytics } from './components/SEO';
import { useFilteredListings } from './hooks';
import { LoadingFallback } from './components/ErrorBoundary';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const KYCPage = lazy(() => import('./pages/KYCPage'));

export default function App() {
  const { currentPage } = useStore();

  // SEO configuration per page
  const seoConfig: Record<string, { title: string; description: string }> = {
    landing: { title: 'Marketplace Limbah Terpercaya Indonesia', description: 'Jual beli limbah plastik, kertas, logam, elektronik dengan aman. Escrow payment, AI assistant, enkripsi lokasi.' },
    marketplace: { title: 'Marketplace', description: 'Temukan ribuan listing limbah dari seluruh Indonesia. Filter berdasarkan kategori, lokasi, dan harga.' },
    'listing-detail': { title: 'Detail Listing', description: 'Detail listing limbah dengan informasi lengkap, lokasi, dan opsi negosiasi.' },
    dashboard: { title: 'Dashboard', description: 'Kelola listing, booking, wallet, dan laporan transaksi Anda.' },
    auth: { title: 'Masuk / Daftar', description: 'Masuk atau daftar akun baru untuk mulai bertransaksi limbah.' },
    admin: { title: 'Admin Panel', description: 'Panel administrasi untuk mengelola platform BursaLimbah.' },
    pricing: { title: 'Harga & Paket', description: 'Pilih paket membership yang sesuai dengan bisnis Anda.' },
    kyc: { title: 'Verifikasi KYC', description: 'Lengkapi verifikasi identitas untuk mengakses fitur lengkap.' },
    payment: { title: 'Pembayaran', description: 'Proses pembayaran dengan escrow yang aman.' },
    schema: { title: 'Database Schema', description: 'Visualisasi skema database PostgreSQL BursaLimbah.' },
    terms: { title: 'Syarat & Ketentuan', description: 'Syarat dan ketentuan penggunaan platform BursaLimbah.' },
    privacy: { title: 'Kebijakan Privasi', description: 'Kebijakan privasi compliant dengan UU PDP No. 27/2023.' },
  };

  const currentSEO = seoConfig[currentPage] || seoConfig.landing;

  return (
    <ErrorBoundary>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={['limbah', 'daur ulang', 'marketplace', 'B2B', 'B2C', 'Indonesia', 'escrow', 'plastik', 'kertas', 'logam']}
        url={`https://bursalimbah.com/${currentPage === 'landing' ? '' : currentPage}`}
      />
      <PreloadResources />
      <Analytics />
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <Suspense fallback={<LoadingFallback />}>
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}
          {currentPage === 'listing-detail' && <ListingDetailPageInline />}
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'auth' && <AuthPage />}
          {currentPage === 'admin' && <AdminPageInline />}
          {currentPage === 'pricing' && <PricingPage />}
          {currentPage === 'kyc' && <KYCPageInline />}            {currentPage === 'payment' && <PaymentPage />}
            {currentPage === 'schema' && <SchemaPage />}
            {currentPage === 'terms' && <LegalPage type="terms" />}
            {currentPage === 'privacy' && <LegalPage type="privacy" />}
            </Suspense>
          </motion.main>
        </AnimatePresence>
        <AIChatWidget />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

/* ============================================
   NAVBAR
   ============================================ */
function Navbar() {
  const { currentPage, setPage, isAuthenticated, currentUser, logout, mobileMenuOpen, setMobileMenuOpen } = useStore();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setPage('landing')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 leading-tight block">
                Bursa<span className="text-emerald-600">Limbah</span>
              </span>
              <span className="text-[9px] text-slate-400 leading-none hidden sm:block">Marketplace Limbah Indonesia</span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <NavLink active={currentPage === 'marketplace'} onClick={() => setPage('marketplace')}>Marketplace</NavLink>
            <NavLink active={currentPage === 'pricing'} onClick={() => setPage('pricing')}>Harga</NavLink>
            {isAuthenticated && <NavLink active={currentPage === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavLink>}
            {currentUser?.role === 'ADMIN' && <NavLink active={currentPage === 'admin'} onClick={() => setPage('admin')}>Admin</NavLink>}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <button onClick={() => setPage('dashboard')} className="flex items-center gap-2 pl-1 hover:bg-slate-50 rounded-lg p-1.5 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{currentUser?.name?.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-700 leading-tight">{currentUser?.name}</p>
                    <p className="text-[10px] text-slate-500">{currentUser?.membershipTier === 'CORPORATE' ? 'Corporate' : currentUser?.membershipTier === 'SMALL_BUSINESS' ? 'Bisnis' : 'Personal'}</p>
                  </div>
                </button>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Keluar">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage('auth')} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">Masuk</button>
                <button onClick={() => setPage('auth')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">Daftar Gratis</button>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {[['marketplace', 'Marketplace'], ['pricing', 'Harga']].map(([page, label]) => (
                <button key={page} onClick={() => { setPage(page as any); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                  {label}
                </button>
              ))}
              {isAuthenticated && <button onClick={() => { setPage('dashboard'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Dashboard</button>}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button onClick={() => { setPage('auth'); setMobileMenuOpen(false); }} className="w-full px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg">Masuk</button>
                  <button onClick={() => { setPage('auth'); setMobileMenuOpen(false); }} className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg">Daftar Gratis</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
      {children}
    </button>
  );
}

/* ============================================
   LANDING PAGE
   ============================================ */
function LandingPageInline() {
  const { setPage } = useStore();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-300 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Platform #1 Perdagangan Limbah Indonesia
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] mb-6">
                Jual Beli Limbah
                <span className="block bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Aman & Transparan</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                Marketplace B2B & B2C untuk perdagangan limbah dengan escrow payment, AI assistant, enkripsi lokasi, dan compliance regulasi KLHK.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setPage('marketplace')} className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-emerald-500/40 transition-all">
                  Jelajahi Marketplace
                </button>
                <button onClick={() => setPage('auth')} className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
                  Daftar Sebagai Seller
                </button>
              </div>
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
                {[['12.5K+', 'Listing Aktif'], ['3.2K+', 'Transaksi/Bulan'], ['150+', 'Kota']].map(([v, l]) => (
                  <div key={l}><p className="text-xl font-bold text-white">{v}</p><p className="text-xs text-slate-400">{l}</p></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="hidden lg:block">
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {[
              { Icon: ShieldCheck, label: 'Escrow Payment' },
              { Icon: Lock, label: 'AES-256 Encryption' },
              { Icon: Scale, label: 'UU PDP Compliant' },
              { Icon: Leaf, label: 'KLHK Verified' },
              { Icon: Award, label: 'ISO 14001' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">Cara Kerja</h2>
            <p className="text-slate-600 mt-3">Proses jual beli limbah yang mudah, aman, dan transparan</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Search className="w-5 h-5" />, title: 'Cari & Temukan', desc: 'Browse ribuan listing dengan filter kategori, lokasi, dan harga.' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'Negosiasi', desc: 'Chat langsung atau gunakan AI assistant untuk negosiasi optimal.' },
              { icon: <CreditCard className="w-5 h-5" />, title: 'Booking & Escrow', desc: 'DP 30% ditahan escrow. Dana aman sampai barang divalidasi.' },
              { icon: <Truck className="w-5 h-5" />, title: 'Pickup & Selesai', desc: 'Lokasi dibuka setelah DP. Pickup, validasi, release dana otomatis.' },
            ].map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 h-full hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">{step.icon}</div>
                    <span className="text-3xl font-bold text-slate-100 font-display">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">Arsitektur Platform</h2>
            <p className="text-slate-600 mt-3">Dibangun dengan teknologi modern untuk performa dan keamanan optimal</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: 'Service Layer', items: ['Auth (NextAuth.js v5)', 'AI Agent (GPT-4o)', 'Payment (Midtrans)', 'Shipping (RajaOngkir)'], color: 'emerald' },
              { icon: <Database className="w-5 h-5" />, title: 'Data Layer', items: ['PostgreSQL (Prisma ORM)', 'Redis (Cache + Queue)', 'S3 + CDN (Assets)', 'Row-Level Security'], color: 'blue' },
              { icon: <Cloud className="w-5 h-5" />, title: 'Infrastructure', items: ['Vercel (Edge)', 'Supabase (Realtime)', 'Upstash (Redis)', 'Cloudflare (DDoS)'], color: 'purple' },
            ].map((layer) => (
              <Card key={layer.title} className="p-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  layer.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  layer.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>{layer.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-3">{layer.title}</h3>
                <ul className="space-y-2">
                  {layer.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">Kategori Limbah</h2>
            <p className="text-slate-600 mt-3">Temukan berbagai jenis limbah sesuai kebutuhan Anda</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {(Object.entries(WASTE_CATEGORIES) as [WasteCategory, typeof WASTE_CATEGORIES[WasteCategory]][]).map(([key, cat]) => (
              <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage('marketplace')} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-center group">
                <span className="text-2xl mb-2 block">{cat.icon}</span>
                <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-700">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="success" size="md"><Lock className="w-3 h-3 mr-1" />Privasi & Keamanan</Badge>
              <h2 className="font-display text-3xl font-bold text-slate-900 mt-4 mb-4">Lokasi Anda Terlindungi</h2>
              <p className="text-slate-600 mb-6">Enkripsi AES-256-GCM melindungi koordinat GPS seller. Lokasi hanya terbuka setelah booking + DP.</p>
              <ul className="space-y-3">
                {['Koordinat GPS terenkripsi di database', 'Hanya kota & provinsi ditampilkan publik', 'Lokasi detail terbuka setelah booking + DP', 'Compliant UU PDP No. 27/2023', 'Audit trail setiap akses data'].map(text => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-600" /></div>
                    <span className="text-sm text-slate-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-600">Yang Dilihat Publik</span>
                  </div>
                  <p className="text-sm text-slate-700">📍 Surabaya, Jawa Timur</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Koordinat: ••••••••••</p>
                </div>
                <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-emerald-500 rotate-90" /></div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Setelah Booking + DP</span>
                  </div>
                  <p className="text-sm text-slate-700">📍 Jl. Rungkut Industri No. 45, Surabaya</p>
                  <p className="text-xs text-emerald-600 mt-1 font-mono">lat: -7.2575, lng: 112.7521</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[10px] px-2 py-1 bg-emerald-600 text-white rounded">Google Maps</button>
                    <button className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Waze</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Mulai Jual Beli Limbah Sekarang</h2>
          <p className="text-emerald-100 text-lg mb-8">Daftar gratis dan dapatkan 100 kredit AI assistant.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setPage('auth')} className="px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">Daftar Gratis</button>
            <button onClick={() => setPage('pricing')} className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">Lihat Harga</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 shadow-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
            </div>
            <span className="text-[10px] text-emerald-300/50 font-mono">bursalimbah.com</span>
          </div>
          {[
            { icon: '🧴', title: 'Limbah Plastik PP Grade A', loc: 'Surabaya', price: 'Rp 4.500' },
            { icon: '⚙️', title: 'Scrap Aluminium Can', loc: 'Tangerang', price: 'Rp 18.000' },
            { icon: '📱', title: 'E-Waste PCB Board', loc: 'Cikarang', price: 'Rp 85.000' },
          ].map(item => (
            <div key={item.title} className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">{item.title}</p>
                <p className="text-[10px] text-emerald-300/60">📍 {item.loc}</p>
              </div>
              <span className="text-xs font-bold text-amber-300">{item.price}/kg</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-[10px] text-emerald-200/60">
              <Bot className="w-3 h-3 inline mr-1" />AI: Ditemukan 247 listing cocok...
            </div>
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-float">LIVE</div>
    </div>
  );
}

/* ============================================
   MARKETPLACE PAGE
   ============================================ */
function MarketplacePageInline() {
  const { setPage, setSelectedListing } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Use optimized hook with memoization and debouncing
  const { filteredListings, total } = useFilteredListings(searchQuery, selectedCategory, sortBy);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Cari limbah... (plastik PP, aluminium, kertas)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm shadow-sm" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
            <option value="newest">Terbaru</option>
            <option value="price_low">Harga Terendah</option>
            <option value="price_high">Harga Tertinggi</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <CatPill active={selectedCategory === 'ALL'} onClick={() => setSelectedCategory('ALL')}>Semua</CatPill>
          {(Object.entries(WASTE_CATEGORIES) as [WasteCategory, typeof WASTE_CATEGORIES[WasteCategory]][]).map(([key, cat]) => (
            <CatPill key={key} active={selectedCategory === key} onClick={() => setSelectedCategory(key)}>{cat.icon} {cat.label}</CatPill>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{filteredListings.length}</span> listing ditemukan</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map(listing => (
          <ListingCard key={listing.id} listing={listing} onClick={() => { setSelectedListing(listing.id); setPage('listing-detail'); }} />
        ))}
      </div>

      {filteredListings.length === 0 && (
        <EmptyState icon={<Package className="w-8 h-8" />} title="Tidak ada listing" description="Coba ubah filter atau kata kunci pencarian" />
      )}
    </div>
  );
}

function CatPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
      {children}
    </button>
  );
}

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const cat = WASTE_CATEGORIES[listing.category];
  const status = TRANSACTION_STATUS_COLORS[listing.status];

  return (
    <motion.button whileHover={{ y: -2 }} onClick={onClick} className="bg-white rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all text-left overflow-hidden group">
      <div className="h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
        <span className="text-4xl">{cat.icon}</span>
        {listing.isB3 && <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">B3</span>}
        {listing.priceTier === 'GOLD' && <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full flex items-center gap-0.5"><Award className="w-2.5 h-2.5" />Premium</span>}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors mb-2">{listing.title}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <MapPin className="w-3 h-3" /><span>{listing.city}, {listing.province}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-emerald-700">{formatRupiah(listing.pricePerKg)}<span className="text-xs font-normal text-slate-500">/{listing.unit}</span></p>
            <p className="text-[11px] text-slate-500">{formatNumber(listing.quantity)} {listing.unit}</p>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${status.bg} ${status.text}`}>{status.label}</span>
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

/* ============================================
   LISTING DETAIL PAGE
   ============================================ */
function ListingDetailPageInline() {
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
      <button onClick={() => setPage('marketplace')} className="flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700 mb-6">
        <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Marketplace
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={listing.isB3 ? 'danger' : 'default'}>{cat.icon} {cat.label}</Badge>
              {listing.isB3 && <Badge variant="danger">☢️ B3</Badge>}
              {listing.priceTier === 'GOLD' && <Badge variant="warning">⭐ Premium</Badge>}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-4">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{listing.city}, {listing.province}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{listing.createdAt}</span>
              <span className="flex items-center gap-1"><Package className="w-4 h-4" />{formatNumber(listing.quantity)} {listing.unit}</span>
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
                      <p className="text-sm font-medium text-slate-900">{opt.courier} - {opt.service}</p>
                      <p className="text-xs text-slate-500">Estimasi: {opt.estimate}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">{formatRupiah(opt.cost)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Seller */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Informasi Seller</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">{listing.sellerName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{listing.sellerName}</p>
                  {listing.sellerTier === 'CORPORATE' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-sm text-slate-500">{listing.sellerTier === 'CORPORATE' ? 'Corporate Member' : listing.sellerTier === 'SMALL_BUSINESS' ? 'Small Business' : 'Personal'}</p>
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
              <p className="text-3xl font-bold text-emerald-700">{formatRupiah(listing.pricePerKg)}</p>
              <p className="text-sm text-slate-500">per {listing.unit}</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Total keseluruhan</p>
                <p className="text-lg font-bold text-slate-900">{formatRupiah(listing.pricePerKg * listing.quantity)}</p>
              </div>
            </div>
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Button variant="primary" className="w-full" onClick={() => setPage('payment')}>Mulai Negosiasi</Button>
                  <Button variant="outline" className="w-full">Chat Seller</Button>
                </>
              ) : (
                <Button variant="primary" className="w-full" onClick={() => setPage('auth')}>Masuk untuk Negosiasi</Button>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
              {[
                { Icon: Shield, text: 'Transaksi dilindungi escrow' },
                { Icon: CreditCard, text: 'DP 30% untuk booking' },
                { Icon: Lock, text: 'Lokasi terbuka setelah DP' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-600">
                  <Icon className="w-4 h-4 text-emerald-600" /><span className="text-xs">{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   DASHBOARD PAGE
   ============================================ */
function DashboardPageInline() {
  const { currentUser } = useStore();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Selamat datang kembali, {currentUser.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentUser.membershipTier === 'CORPORATE' ? 'warning' : currentUser.membershipTier === 'SMALL_BUSINESS' ? 'success' : 'default'} size="md">
            {currentUser.membershipTier === 'CORPORATE' ? '⭐ Corporate' : currentUser.membershipTier === 'SMALL_BUSINESS' ? '🟢 Bisnis' : '👤 Personal'}
          </Badge>
          {currentUser.kycStatus !== 'VERIFIED' && (
            <Badge variant="warning" size="md">KYC Pending</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <DashboardOverview />}
      {activeTab === 'listings' && <DashboardListings />}
      {activeTab === 'bookings' && <DashboardBookings />}
      {activeTab === 'wallet' && <DashboardWallet />}
      {activeTab === 'reports' && <DashboardReports />}
      {activeTab === 'settings' && <DashboardSettings />}
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transaksi" value="12" change="+3 bulan ini" icon={<Package className="w-5 h-5" />} />
        <StatCard title="Pendapatan" value="Rp 24.5 Jt" change="+18% dari bulan lalu" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Listing Aktif" value="8" change="2 butuh review" icon={<FileText className="w-5 h-5" />} />
        <StatCard title="Rating" value="4.8/5.0" change="23 review" icon={<Star className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.listingTitle}</p>
                  <p className="text-xs text-slate-500">{tx.buyerName} → {tx.sellerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-900">{formatRupiah(tx.totalPrice)}</p>
                  <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'info'}>{TRANSACTION_STATUS_COLORS[tx.status].label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Status Transaksi</h3>
          <TransactionTimeline events={[
            { status: 'BOOKED', label: 'Booking dikonfirmasi', date: '16 Nov 2024', completed: true },
            { status: 'PAID_DP', label: 'DP dibayar (Rp 2.520.000)', date: '16 Nov 2024', completed: true },
            { status: 'READY_PICKUP', label: 'Siap ambil di Surabaya', date: '18 Nov 2024', completed: false, current: true },
            { status: 'DELIVERED', label: 'Barang diterima', date: '-', completed: false },
            { status: 'COMPLETED', label: 'Dana di-release', date: '-', completed: false },
          ]} />
        </Card>
      </div>
    </div>
  );
}

function DashboardListings() {
  const { setPage } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{MOCK_LISTINGS.slice(0, 4).length} listing aktif</p>
        <Button variant="primary" size="sm"><Upload className="w-4 h-4" />Buat Listing</Button>
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
              {MOCK_LISTINGS.slice(0, 5).map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{l.title}</p>
                    <p className="text-xs text-slate-500">{l.city}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge>{WASTE_CATEGORIES[l.category].icon} {WASTE_CATEGORIES[l.category].label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatRupiah(l.pricePerKg)}/{l.unit}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'SOLD' ? 'success' : l.status === 'NEGOTIATING' ? 'warning' : 'info'}>
                      {LISTING_STATUS_COLORS[l.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPage('listing-detail')} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">Lihat →</button>
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

function DashboardBookings() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{MOCK_TRANSACTIONS.length} transaksi</p>
      {MOCK_TRANSACTIONS.map(tx => (
        <Card key={tx.id} className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900">{tx.listingTitle}</p>
              <p className="text-sm text-slate-500 mt-1">{tx.buyerName} → {tx.sellerName}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{tx.estimatedPickup}</span>
                <span>{formatNumber(tx.quantity)} kg</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{formatRupiah(tx.totalPrice)}</p>
              <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'info'} size="md">{TRANSACTION_STATUS_COLORS[tx.status].label}</Badge>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <ProgressStepper steps={['Book', 'DP', 'Pickup', 'Transit', 'Validasi', 'Selesai']} currentStep={tx.status === 'COMPLETED' ? 5 : tx.status === 'PAID_DP' ? 1 : 2} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function DashboardWallet() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <p className="text-sm text-emerald-200">Saldo Tersedia</p>
          <p className="text-2xl font-bold mt-1">Rp 15.250.000</p>
          <Button variant="secondary" size="sm" className="mt-4 bg-white/20 text-white hover:bg-white/30 border-0">Tarik Dana</Button>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {tx.type === 'in' ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.desc}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}{formatRupiah(Math.abs(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DashboardReports() {
  const featureGate = useFeatureGate();
  if (!featureGate.exportReports) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Fitur Laporan</h3>
        <p className="text-sm text-slate-500 mt-2 mb-4">Upgrade ke Small Business atau Corporate untuk mengakses laporan.</p>
        <Button variant="primary">Upgrade Sekarang</Button>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Laporan</h3>
        <Button variant="outline" size="sm"><FileText className="w-4 h-4" />Export PDF</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Penjualan Bulanan</h4>
          {[['Nov 2024', 100, 'Rp 24.5 Jt'], ['Oct 2024', 74, 'Rp 18.2 Jt'], ['Sep 2024', 64, 'Rp 15.8 Jt']].map(([m, w, v]) => (
            <div key={m as string} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{m}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${w}%` }}></div></div>
                <span className="text-xs font-medium text-slate-700 w-16 text-right">{v}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Kategori Terjual</h4>
          {[['Plastik', 45, 'Rp 11.2 Jt'], ['Logam', 30, 'Rp 7.5 Jt'], ['Tekstil', 15, 'Rp 3.7 Jt'], ['Kertas', 10, 'Rp 2.1 Jt']].map(([c, w, v]) => (
            <div key={c as string} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{c}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${w}%` }}></div></div>
                <span className="text-xs font-medium text-slate-700 w-16 text-right">{v}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function DashboardSettings() {
  const { currentUser, setPage } = useStore();
  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Profil</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nama</label>
              <input type="text" defaultValue={currentUser.name} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" defaultValue={currentUser.email} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Telepon</label>
              <input type="tel" defaultValue={currentUser.phone} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kota</label>
              <input type="text" defaultValue={currentUser.city} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <Button variant="primary" size="sm">Simpan Perubahan</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Verifikasi KYC</h3>
        <p className="text-sm text-slate-600 mb-4">Status: <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{currentUser.kycStatus || 'NOT_STARTED'}</Badge></p>
        {currentUser.kycStatus !== 'VERIFIED' && (
          <Button variant="primary" size="sm" onClick={() => setPage('kyc')}>Mulai Verifikasi</Button>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Membership</h3>
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div>
            <p className="font-medium text-emerald-800">{currentUser.membershipTier === 'CORPORATE' ? 'Corporate' : currentUser.membershipTier === 'SMALL_BUSINESS' ? 'Small Business' : 'Personal'}</p>
            <p className="text-xs text-emerald-600">
              {currentUser.membershipTier === 'CORPORATE' ? 'Unlimited listing, API access, dedicated manager' :
               currentUser.membershipTier === 'SMALL_BUSINESS' ? '25 listing, AI full, export reports' :
               '5 listing, AI basic'}
            </p>
          </div>
          {currentUser.membershipTier !== 'CORPORATE' && (
            <Button variant="primary" size="sm" onClick={() => setPage('pricing')}>Upgrade</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================
   AUTH PAGE
   ============================================ */
function AuthPageInline() {
  const { login, setUser, register, setPage } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setPage('dashboard');
      } else {
        setError(result.error || 'Login gagal');
      }
    } else {
      if (!name || !email || !password) { setError('Semua field harus diisi'); setLoading(false); return; }
      register({ name, email });
      setPage('dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{isLogin ? 'Masuk ke BursaLimbah' : 'Daftar Akun Baru'}</h1>
          <p className="text-sm text-slate-600 mt-1">{isLogin ? 'Kelola transaksi limbah Anda' : 'Mulai jual beli limbah dengan aman'}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama / Perusahaan</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="PT Contoh Indonesia" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@perusahaan.com" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <Button variant="primary" className="w-full" loading={loading} type="submit">
              {isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-1">Demo accounts:</p>
              <p className="text-xs text-slate-600">• budi@plastikjaya.com (Seller, Bisnis)</p>
              <p className="text-xs text-slate-600">• siti@greencycle.id (Buyer, Corporate)</p>
              <p className="text-xs text-slate-600">• admin@bursalimbah.com (Admin)</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              {isLogin ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </Card>

        <p className="text-xs text-center text-slate-500 mt-6">
          Dengan mendaftar, Anda menyetujui <button onClick={() => setPage('terms')} className="text-emerald-600 hover:underline">Syarat & Ketentuan</button> dan <button onClick={() => setPage('privacy')} className="text-emerald-600 hover:underline">Kebijakan Privasi</button>.
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================
   PAYMENT PAGE
   ============================================ */
function PaymentPage() {
  const { setPage } = useStore();
  const [step, setStep] = useState(0); // 0: review, 1: payment, 2: success
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    const result = await PaymentService.createTransaction({
      listingId: 'l1', quantity: 2000, pricePerKg: 4200, dpPercentage: 30,
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
                  <div className="flex justify-between"><span className="text-slate-600">Quantity</span><span className="font-medium">2.000 kg</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Harga/kg</span><span className="font-medium">{formatRupiah(4200)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatRupiah(8400000)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Platform fee (2.5%)</span><span className="font-medium">{formatRupiah(210000)}</span></div>
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
                <Button variant="outline" onClick={() => setPage('marketplace')}>Batal</Button>
                <Button variant="primary" className="flex-1" onClick={handlePayment} loading={loading}>Lanjut ke Pembayaran</Button>
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
                <p className="text-sm font-medium text-amber-800">Transaction ID: {txResult?.transactionId}</p>
                <p className="text-xs text-amber-600 mt-1">Berlaku hingga: {txResult ? new Date(txResult.expiryTime).toLocaleString('id-ID') : '-'}</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-slate-700">Pilih Metode Pembayaran:</p>
                {['BCA Virtual Account', 'Mandiri Virtual Account', 'GoPay', 'ShopeePay', 'QRIS'].map(method => (
                  <label key={method} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                    <input type="radio" name="payment" className="text-emerald-600" defaultChecked={method === 'BCA Virtual Account'} />
                    <span className="text-sm text-slate-700">{method}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-6">
                <p className="text-sm font-medium text-emerald-800">Total DP: {formatRupiah(txResult?.dpAmount || 0)}</p>
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
              <p className="text-sm text-slate-600 mb-6">DP Anda telah diterima dan ditahan di escrow. Seller akan menyiapkan barang.</p>

              <div className="p-4 bg-slate-50 rounded-lg text-left mb-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Order ID</span><span className="font-mono font-medium">ORD-{txResult?.transactionId?.split('-')[1]}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">DP Dibayar</span><span className="font-medium text-emerald-700">{formatRupiah(txResult?.dpAmount || 0)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge variant="success">PAID_DP</Badge></div>
              </div>

              <Alert type="info" title="Lokasi akan terbuka">
                Setelah seller mengkonfirmasi kesiapan, lokasi detail akan terbuka untuk Anda.
              </Alert>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setPage('dashboard')}>Ke Dashboard</Button>
                <Button variant="primary" onClick={() => setPage('marketplace')}>Lanjut Belanja</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   KYC PAGE
   ============================================ */
function KYCPageInline() {
  const { setPage } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const steps = [
    { title: 'KTP', desc: 'Verifikasi identitas dengan KTP', icon: <User className="w-5 h-5" /> },
    { title: 'NPWP', desc: 'Verifikasi nomor pajak', icon: <FileText className="w-5 h-5" /> },
    { title: 'NIB', desc: 'Nomor Induk Berusaha (untuk bisnis)', icon: <Building2 className="w-5 h-5" /> },
    { title: 'Izin Lingkungan', desc: 'Izin KLHK untuk limbah B3', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const handleVerify = async () => {
    setLoading(true);
    let result: { status?: string; message?: string; valid?: boolean; issuer?: string; expiryDate?: string } = {};
    switch (currentStep) {
      case 0: result = await KYCService.submitKTP({ name: '', nik: '', photo: '' }); break;
      case 1: result = await KYCService.submitNPWP({ npwp: '', document: '' }); break;
      case 2: result = await KYCService.submitNIB({ nib: '', document: '' }); break;
      case 3: result = await KYCService.checkEnvironmentalPermit({ permitNumber: '' }); break;
    }
    setResults(prev => ({ ...prev, [currentStep]: result }));
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Verifikasi KYC/KYB</h1>
        <p className="text-sm text-slate-600 mt-1">Lengkapi verifikasi untuk mengakses fitur lengkap</p>
      </div>

      <ProgressStepper steps={steps.map(s => s.title)} currentStep={currentStep} />

      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              {steps[currentStep].icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-slate-500">{steps[currentStep].desc}</p>
            </div>
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NIK (16 digit)</label>
                <input type="text" placeholder="3201xxxxxxxxxxxx" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Foto KTP</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Klik atau drag foto KTP ke sini</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG. Max 5MB</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NPWP</label>
                <input type="text" placeholder="01.234.567.8-901.000" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Dokumen NPWP</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Upload kartu/faktur NPWP</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">NIB (Nomor Induk Berusaha)</label>
                <input type="text" placeholder="1234567890123" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <Alert type="info">NIB dapat diperoleh melalui OSS (oss.go.id)</Alert>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Izin KLHK</label>
                <input type="text" placeholder="SKT-XXXX/XXXX" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <Alert type="warning">Wajib untuk penanganan limbah B3 sesuai PP No. 22/2021</Alert>
            </div>
          )}

          {results[currentStep] && (
            <Alert type="success" title="Berhasil dikirim">
              {results[currentStep].message || 'Verifikasi sedang diproses'}
            </Alert>
          )}

          <div className="mt-6 flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)}>Kembali</Button>
            )}
            <Button variant="primary" className="flex-1" onClick={() => {
              if (results[currentStep]) {
                if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
                else setPage('dashboard');
              } else {
                handleVerify();
              }
            }} loading={loading}>
              {results[currentStep] ? (currentStep < steps.length - 1 ? 'Lanjut' : 'Selesai') : 'Verifikasi'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================
   ADMIN PAGE
   ============================================ */
function AdminPageInline() {
  const { setPage } = useStore();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-600">Kelola platform BursaLimbah</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPage('schema')}>
          <Database className="w-4 h-4" /> Lihat Schema Database
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total User', value: '2,847', change: '+124 minggu ini', color: 'emerald' },
          { title: 'Listing Aktif', value: '12,543', change: '18 perlu moderasi', color: 'amber' },
          { title: 'Transaksi Hari Ini', value: '87', change: '+15% dari kemarin', color: 'blue' },
          { title: 'Revenue', value: 'Rp 124 Jt', change: 'Bulan ini', color: 'purple' },
        ].map(s => (
          <Card key={s.title} className="p-5">
            <p className="text-sm text-slate-600">{s.title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Listing Perlu Moderasi
          </h3>
          <div className="space-y-3">
            {MOCK_LISTINGS.filter(l => l.isB3).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{l.title}</p>
                  <p className="text-xs text-slate-500">{l.sellerName} • {l.city}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Approve</Button>
                  <Button variant="danger" size="sm">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> User Terbaru
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Budi Santoso', email: 'budi@plastikjaya.com', tier: 'Bisnis', verified: true },
              { name: 'Siti Rahayu', email: 'siti@greencycle.id', tier: 'Corporate', verified: true },
              { name: 'Ahmad Wijaya', email: 'ahmad@personal.com', tier: 'Personal', verified: false },
            ].map(u => (
              <div key={u.email} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-700">{u.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <Badge variant={u.verified ? 'success' : 'warning'}>{u.verified ? '✓ Verified' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================
   PRICING PAGE
   ============================================ */
function PricingPageInline() {
  const { setPage } = useStore();
  const plans = [
    { name: 'Personal', price: 'Gratis', desc: 'Untuk individu dan pemula', features: ['5 listing aktif', '20 negosiasi/bulan', 'AI Chat (basic)', 'Escrow protection', 'Rating & review'], cta: 'Mulai Gratis', highlighted: false },
    { name: 'Small Business', price: 'Rp 299.000', period: '/bulan', desc: 'Untuk UMKM dan pengepul', features: ['25 listing aktif', '100 negosiasi/bulan', 'AI Chat (full)', 'Riwayat buyer/seller', 'Bulk upload', 'Export laporan', 'Priority support'], cta: 'Pilih Bisnis', highlighted: true },
    { name: 'Corporate', price: 'Rp 999.000', period: '/bulan', desc: 'Untuk perusahaan & industri', features: ['Unlimited listing', 'Unlimited negosiasi', 'AI Chat + custom prompts', 'Priority listing', 'Dedicated manager', 'API access', 'Custom SLA escrow', 'Price tier Gold', 'PPh 23 support'], cta: 'Hubungi Sales', highlighted: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">Paket Membership</h1>
        <p className="text-slate-600 mt-3">Pilih paket sesuai skala bisnis Anda</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlighted ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 scale-105 shadow-xl' : 'bg-white border border-slate-200'}`}>
            {plan.highlighted && <div className="text-center mb-4"><span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">POPULER</span></div>}
            <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            <p className={`text-sm mt-1 ${plan.highlighted ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.desc}</p>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.period && <span className={`text-sm ${plan.highlighted ? 'text-emerald-200' : 'text-slate-500'}`}>{plan.period}</span>}
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <span className={plan.highlighted ? 'text-emerald-50' : 'text-slate-700'}>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setPage('auth')} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${plan.highlighted ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   LEGAL PAGES
   ============================================ */
function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-8">
        {type === 'terms' ? (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Syarat & Ketentuan</h1>
            <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 1 November 2024</p>
            <div className="space-y-6 text-sm text-slate-700">
              {[
                ['Ketentuan Umum', 'BursaLimbah.com adalah platform marketplace yang mempertemukan penjual dan pembeli limbah di Indonesia. Sesuai KUHPerdata.'],
                ['Pendaftaran & KYC', 'Verifikasi identitas wajib. Corporate tier memerlukan NPWP, NIB, dan izin KLHK untuk limbah B3.'],
                ['Transaksi & Escrow', 'Dana ditahan escrow hingga validasi. Platform fee 2-5%. Release max 7 hari setelah pickup.'],
                ['Limbah B3', 'Hanya pihak berizin KLHK. Sesuai PP No. 22/2021. BursaLimbah berhak menolak listing non-compliant.'],
                ['Penyelesaian Sengketa', 'Mediasi 3x24 jam. Jika gagal, melalui BAPSI atau jalur hukum Indonesia.'],
              ].map(([title, content]) => (
                <section key={title}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
                  <p>{content}</p>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Kebijakan Privasi</h1>
            <p className="text-sm text-slate-500 mb-8">Compliant UU PDP No. 27/2023 • Terakhir diperbarui: 1 November 2024</p>
            <div className="space-y-6 text-sm text-slate-700">
              {[
                ['Pengumpulan Data', 'Nama, email, telepon, alamat usaha, data transaksi. Lokasi GPS dienkripsi AES-256-GCM.'],
                ['Penggunaan Data', 'Memproses transaksi, verifikasi identitas, meningkatkan layanan. Tidak dijual ke pihak ketiga.'],
                ['Perlindungan Lokasi', 'Koordinat terenkripsi. Hanya kota/provinsi publik. Detail terbuka setelah booking + DP.'],
                ['Hak Pengguna (UU PDP)', 'Hak mengakses, memperbaiki, menghapus data. Hak portabilitas dan menarik consent.'],
                ['Retensi Data', 'Data transaksi 10 tahun (pajak). Data pribadi dihapus 30 hari setelah permintaan.'],
              ].map(([title, content]) => (
                <section key={title}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
                  <p>{content}</p>
                </section>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ============================================
   AI CHAT WIDGET
   ============================================ */
function AIChatWidget() {
  const { chatOpen, toggleChat, chatMessages, addMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: `msg_${Date.now()}`, senderId: 'user', senderName: 'Anda', content: input, isAI: false, timestamp: new Date().toISOString() };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const allMessages = [...chatMessages, userMsg].map(m => ({ role: m.isAI ? 'assistant' as const : 'user' as const, content: m.content }));
    const response = await AIAgentService.chat(allMessages);

    const aiMsg = {
      id: `msg_${Date.now()}_ai`,
      senderId: 'ai',
      senderName: 'Asisten BursaLimbah',
      content: response.content,
      isAI: true,
      timestamp: new Date().toISOString(),
      toolCalls: response.toolCalls,
    };
    addMessage(aiMsg);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden mb-4">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                <div><p className="text-sm font-medium">Asisten AI</p><p className="text-xs text-emerald-200">GPT-4o • Online</p></div>
              </div>
              <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.isAI ? 'bg-slate-100 text-slate-800 rounded-bl-md' : 'bg-emerald-600 text-white rounded-br-md'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.toolCalls && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] opacity-60 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {msg.toolCalls.map(tc => tc.name).join(', ')}()
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanya tentang limbah, harga, regulasi..." className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={handleSend} disabled={!input.trim()} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">AI bisa salah. Verifikasi info penting.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${chatOpen ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
        {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>
    </div>
  );
}

/* ============================================
   SCHEMA PAGE (Database Visualization)
   ============================================ */
function SchemaPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const modelColors: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-50',
    blue: 'border-blue-500 bg-blue-50',
    amber: 'border-amber-500 bg-amber-50',
    purple: 'border-purple-500 bg-purple-50',
    teal: 'border-teal-500 bg-teal-50',
    pink: 'border-pink-500 bg-pink-50',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">Database Schema</h1>
        <p className="text-slate-600 mt-2">Visualisasi skema PostgreSQL yang digunakan oleh BursaLimbah.com</p>
      </div>

      <Alert type="info" title="Prisma ORM + PostgreSQL">
        Skema ini diimplementasikan menggunakan Prisma ORM dengan PostgreSQL sebagai database utama. Setiap model memiliki Row-Level Security (RLS) untuk proteksi data multi-tenant.
      </Alert>

      {/* Model Overview */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRISMA_SCHEMA.map((model: any) => (
          <Card
            key={model.name}
            className={`p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 ${modelColors[model.color]}`}
            onClick={() => setSelectedModel(selectedModel === model.name ? null : model.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-slate-900">{model.name}</h3>
              <Badge variant="outline">{model.fields.length} fields</Badge>
            </div>
            <p className="text-sm text-slate-600">{model.description}</p>
          </Card>
        ))}
      </div>

      {/* Selected Model Detail */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Model: {selectedModel}
              </h2>
              <button
                onClick={() => setSelectedModel(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Field</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Attributes</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PRISMA_SCHEMA.find((m: any) => m.name === selectedModel)?.fields.map((field: any) => (
                    <tr key={field.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-900">{field.name}</code>
                          {field.isPK && <Badge variant="warning">PK</Badge>}
                          {field.isFK && <Badge variant="info">FK</Badge>}
                          {field.isRelation && <Badge variant="success">Relation</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {field.type}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {field.isOptional && <Badge variant="outline">nullable</Badge>}
                          {field.isPK && <Badge variant="warning">@id</Badge>}
                          {field.isFK && <Badge variant="info">@relation</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {field.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Schema Relationships */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Relasi Antar Model</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="warning">Listing</Badge>
              <span className="text-slate-600 ml-2">1:N (seller memiliki banyak listing)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">Booking</Badge>
              <span className="text-slate-600 ml-2">1:N (buyer memiliki banyak booking)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="warning">Listing</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">Booking</Badge>
              <span className="text-slate-600 ml-2">1:N (listing dapat memiliki banyak booking)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="success">User</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="info">CompanyInfo</Badge>
              <span className="text-slate-600 ml-2">1:1 (user memiliki satu company info)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Badge variant="info">Booking</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge variant="success">Validation</Badge>
              <span className="text-slate-600 ml-2">1:1 (booking memiliki satu validation)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Features */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Fitur Keamanan Database</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900">AES-256-GCM Encryption</h4>
              </div>
              <p className="text-sm text-emerald-700">Koordinat GPS seller dienkripsi di kolom <code className="bg-emerald-100 px-1 rounded">encryptedCoords</code>. Hanya terbuka setelah booking + DP.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Row-Level Security</h4>
              </div>
              <p className="text-sm text-blue-700">Setiap query divalidasi berdasarkan role dan ownership. User hanya bisa akses data mereka sendiri.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Audit Trail</h4>
              </div>
              <p className="text-sm text-amber-700">Setiap akses data sensitif dicatat dengan timestamp, user ID, dan IP address untuk compliance UU PDP.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Encrypted PII</h4>
              </div>
              <p className="text-sm text-purple-700">Data pribadi (phone, email, NPWP) dienkripsi at-rest menggunakan PostgreSQL pgcrypto extension.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================
   FOOTER
   ============================================ */
function Footer() {
  const { setPage } = useStore();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Recycle className="w-4 h-4 text-white" /></div>
              <span className="font-display font-bold text-lg text-white">BursaLimbah</span>
            </div>
            <p className="text-sm text-slate-400">Marketplace perdagangan limbah terpercaya di Indonesia.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setPage('marketplace')} className="hover:text-emerald-400">Marketplace</button></li>
              <li><button onClick={() => setPage('pricing')} className="hover:text-emerald-400">Harga</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setPage('terms')} className="hover:text-emerald-400">Syarat & Ketentuan</button></li>
              <li><button onClick={() => setPage('privacy')} className="hover:text-emerald-400">Kebijakan Privasi</button></li>
              <li><button onClick={() => setPage('schema')} className="hover:text-emerald-400">Database Schema</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@bursalimbah.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +62 21-5555-BURS</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2024 BursaLimbah.com. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> UU PDP</span>
            <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> Eco-Friendly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
