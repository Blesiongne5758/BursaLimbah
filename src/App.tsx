/**
 * BursaLimbah.com - Main Application
 * B2B & B2C Marketplace for waste trading in Indonesia
 */

import { useEffect, useState } from 'react';
import { useStore, useFeatureGate } from './store';
import { MOCK_LISTINGS, MOCK_TRANSACTIONS, MOCK_USERS, formatRupiah, formatNumber } from './data';
import { WASTE_CATEGORIES, TRANSACTION_STATUS_COLORS, type WasteCategory, type Listing } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Recycle, Search, MapPin, Shield, TrendingUp, Users, Star, ArrowRight,
  Menu, X, ChevronRight, Filter, MessageCircle, Bot, Send, Package,
  Wallet, BarChart3, Settings, LogOut, Bell, Check, AlertCircle,
  Lock, Eye, EyeOff, Upload, Sparkles, Globe, Building2, User,
  Phone, Mail, Calendar, Clock, Truck, CreditCard, FileText,
  ChevronDown, Zap, Award, Target, ShieldCheck, Scale, Leaf
} from 'lucide-react';

export default function App() {
  const { currentPage } = useStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}
          {currentPage === 'listing-detail' && <ListingDetailPage />}
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'auth' && <AuthPage />}
          {currentPage === 'admin' && <AdminPage />}
          {currentPage === 'pricing' && <PricingPage />}
          {currentPage === 'terms' && <LegalPage type="terms" />}
          {currentPage === 'privacy' && <LegalPage type="privacy" />}
        </motion.main>
      </AnimatePresence>
      <AIChatWidget />
      <Footer />
    </div>
  );
}

/* ============================================
   NAVBAR
   ============================================ */
function Navbar() {
  const { currentPage, setPage, isAuthenticated, currentUser, logout, mobileMenuOpen, setMobileMenuOpen } = useStore();

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setPage('landing')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Bursa<span className="text-emerald-600">Limbah</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink active={currentPage === 'marketplace'} onClick={() => setPage('marketplace')}>Marketplace</NavLink>
            <NavLink active={currentPage === 'pricing'} onClick={() => setPage('pricing')}>Harga</NavLink>
            {isAuthenticated && (
              <NavLink active={currentPage === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavLink>
            )}
            {currentUser?.role === 'ADMIN' && (
              <NavLink active={currentPage === 'admin'} onClick={() => setPage('admin')}>Admin</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">{currentUser?.name?.charAt(0)}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-slate-700 leading-tight">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.membershipTier === 'CORPORATE' ? 'Corporate' : currentUser?.membershipTier === 'SMALL_BUSINESS' ? 'Bisnis' : 'Personal'}</p>
                  </div>
                  <button onClick={logout} className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Keluar">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage('auth')} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                  Masuk
                </button>
                <button onClick={() => setPage('auth')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-colors">
                  Daftar Gratis
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <MobileNavLink onClick={() => { setPage('marketplace'); setMobileMenuOpen(false); }}>Marketplace</MobileNavLink>
              <MobileNavLink onClick={() => { setPage('pricing'); setMobileMenuOpen(false); }}>Harga</MobileNavLink>
              {isAuthenticated && <MobileNavLink onClick={() => { setPage('dashboard'); setMobileMenuOpen(false); }}>Dashboard</MobileNavLink>}
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

function MobileNavLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
      {children}
    </button>
  );
}

/* ============================================
   LANDING PAGE
   ============================================ */
function LandingPage() {
  const { setPage } = useStore();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-sm text-emerald-200 mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Platform #1 Perdagangan Limbah Indonesia</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Jual Beli Limbah
                <span className="block text-emerald-300">Aman & Transparan</span>
              </h1>
              <p className="text-lg text-emerald-100/80 mb-8 max-w-lg">
                Marketplace B2B & B2C untuk perdagangan limbah plastik, kertas, logam, elektronik, dan lainnya. Dilengkapi escrow payment, AI assistant, dan proteksi data lokasi.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPage('marketplace')} className="px-6 py-3 bg-white text-emerald-800 font-semibold rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-all">
                  Jelajahi Marketplace
                </button>
                <button onClick={() => setPage('auth')} className="px-6 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                  Daftar Sebagai Seller
                </button>
              </div>
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
                <Stat label="Listing Aktif" value="12.5K+" />
                <Stat label="Transaksi/Bulan" value="3.2K+" />
                <Stat label="Kota Terjangkau" value="150+" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" />Escrow Payment</div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-emerald-600" />Data Terenkripsi</div>
            <div className="flex items-center gap-2"><Scale className="w-5 h-5 text-emerald-600" />Compliant UU PDP</div>
            <div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-600" />Ramah Lingkungan</div>
            <div className="flex items-center gap-2"><Award className="w-5 h-5 text-emerald-600" />Terverifikasi KLHK</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Cara Kerja" subtitle="Proses jual beli limbah yang mudah, aman, dan transparan" />
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <StepCard step={1} icon={<Search className="w-6 h-6" />} title="Cari & Temukan" description="Browse ribuan listing limbah dari seluruh Indonesia. Filter berdasarkan kategori, lokasi, dan harga." />
            <StepCard step={2} icon={<MessageCircle className="w-6 h-6" />} title="Negosiasi" description="Chat langsung dengan seller atau gunakan AI assistant untuk negosiasi harga yang optimal." />
            <StepCard step={3} icon={<CreditCard className="w-6 h-6" />} title="Booking & Bayar" description="DP 30% ditahan di escrow. Dana aman sampai barang diterima dan divalidasi." />
            <StepCard step={4} icon={<Truck className="w-6 h-6" />} title="Pickup & Selesai" description="Lokasi dibuka setelah booking. Pickup barang, validasi, dan release dana otomatis." />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Kategori Limbah" subtitle="Temukan berbagai jenis limbah sesuai kebutuhan Anda" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
            {(Object.entries(WASTE_CATEGORIES) as [WasteCategory, typeof WASTE_CATEGORIES[WasteCategory]][]).map(([key, cat]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('marketplace')}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all text-center group"
              >
                <span className="text-3xl mb-3 block">{cat.icon}</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                <Lock className="w-4 h-4" />
                Privasi & Keamanan
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
                Lokasi Anda Terlindungi
              </h2>
              <p className="text-slate-600 mb-6">
                Kami menggunakan enkripsi AES-256-GCM untuk melindungi koordinat GPS seller. Lokasi hanya ditampilkan setelah transaksi dikonfirmasi dan DP dibayar.
              </p>
              <ul className="space-y-3">
                <PrivacyFeature text="Koordinat GPS terenkripsi di database" />
                <PrivacyFeature text="Hanya kota & provinsi yang ditampilkan publik" />
                <PrivacyFeature text="Lokasi detail terbuka setelah booking + DP" />
                <PrivacyFeature text="Compliant dengan UU PDP No. 27/2023" />
                <PrivacyFeature text="Audit trail untuk setiap akses data" />
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl p-8 border border-emerald-100">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Yang Dilihat Publik</span>
                  </div>
                  <p className="text-sm text-slate-500">📍 Surabaya, Jawa Timur</p>
                  <p className="text-xs text-slate-400 mt-1">Koordinat: ••••••••</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-emerald-500 rotate-90" />
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Setelah Booking + DP</span>
                  </div>
                  <p className="text-sm text-slate-500">📍 Jl. Rungkut Industri No. 45, Surabaya</p>
                  <p className="text-xs text-emerald-600 mt-1">✓ Lokasi terdekripsi & siap diambil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Dipercaya Ribuan Pelaku Usaha" subtitle="Apa kata mereka tentang BursaLimbah" />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <TestimonialCard name="Hendra K." role="Owner, CV Plastik Mandiri" text="Sejak pakai BursaLimbah, penjualan limbah plastik kami naik 40%. Escrow system membuat buyer lebih percaya." rating={5} />
            <TestimonialCard name="Diana S." role="Procurement, PT Recycle Indonesia" text="AI assistant sangat membantu mencari supplier. Negosiasi jadi lebih efisien, harga lebih kompetitif." rating={5} />
            <TestimonialCard name="Rudi W." role="Manager, UD Kertas Sejahtera" text="Fitur privasi lokasi sangat penting untuk keamanan gudang kami. Hanya buyer yang sudah bayar DP yang bisa lihat alamat." rating={4} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Mulai Jual Beli Limbah Sekarang</h2>
          <p className="text-emerald-100 text-lg mb-8">Daftar gratis dan dapatkan 100 kredit AI assistant untuk membantu transaksi Anda.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setPage('auth')} className="px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Daftar Gratis Sekarang
            </button>
            <button onClick={() => setPage('pricing')} className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              Lihat Paket Harga
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <span className="text-xs text-emerald-200/60">bursalimbah.com</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧴</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Limbah Plastik PP Grade A</p>
                  <p className="text-xs text-emerald-200/70">Surabaya, Jawa Timur</p>
                </div>
                <span className="text-sm font-bold text-amber-300">Rp 4.500/kg</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Scrap Aluminium Can</p>
                  <p className="text-xs text-emerald-200/70">Tangerang, Banten</p>
                </div>
                <span className="text-sm font-bold text-amber-300">Rp 18.000/kg</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">E-Waste PCB Board</p>
                  <p className="text-xs text-emerald-200/70">Cikarang, Jawa Barat</p>
                </div>
                <span className="text-sm font-bold text-amber-300">Rp 85.000/kg</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-emerald-200/70">
              <Bot className="w-3 h-3 inline mr-1" />
              AI: Ditemukan 247 listing cocok...
            </div>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float">
        LIVE
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-emerald-200/70">{label}</p>
    </div>
  );
}

function StepCard({ step, icon, title, description }: { step: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      className="relative"
    >
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all h-full">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-4">
          {icon}
        </div>
        <div className="absolute top-6 right-6 text-4xl font-bold text-slate-100 font-display">{step}</div>
        <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}

function PrivacyFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
      <span className="text-sm text-slate-700">{text}</span>
    </li>
  );
}

function TestimonialCard({ name, role, text, rating }: { name: string; role: string; text: string; rating: number }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
      <p className="text-sm text-slate-600 mb-4">"{text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-emerald-700">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-600">{subtitle}</p>
    </div>
  );
}

/* ============================================
   MARKETPLACE PAGE
   ============================================ */
function MarketplacePage() {
  const { setPage, setSelectedListing } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredListings = MOCK_LISTINGS.filter(listing => {
    if (selectedCategory !== 'ALL' && listing.category !== selectedCategory) return false;
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) && !listing.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.pricePerKg - b.pricePerKg;
    if (sortBy === 'price_high') return b.pricePerKg - a.pricePerKg;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari limbah... (contoh: plastik PP, aluminium, kertas)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="sm:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <CategoryPill active={selectedCategory === 'ALL'} onClick={() => setSelectedCategory('ALL')}>Semua</CategoryPill>
          {(Object.entries(WASTE_CATEGORIES) as [WasteCategory, typeof WASTE_CATEGORIES[WasteCategory]][]).map(([key, cat]) => (
            <CategoryPill key={key} active={selectedCategory === key} onClick={() => setSelectedCategory(key)}>
              {cat.icon} {cat.label}
            </CategoryPill>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">{filteredListings.length}</span> listing ditemukan
        </p>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="newest">Terbaru</option>
          <option value="price_low">Harga Terendah</option>
          <option value="price_high">Harga Tertinggi</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onClick={() => { setSelectedListing(listing.id); setPage('listing-detail'); }}
          />
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">Tidak ada listing ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${active ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
      {children}
    </button>
  );
}

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const cat = WASTE_CATEGORIES[listing.category];
  const statusInfo = TRANSACTION_STATUS_COLORS[listing.status];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all text-left overflow-hidden group"
    >
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
        <span className="text-5xl">{cat.icon}</span>
        {listing.isB3 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">B3</span>
        )}
        {listing.priceTier === 'GOLD' && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Premium
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">{listing.title}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{listing.city}, {listing.province}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-emerald-700">{formatRupiah(listing.pricePerKg)}<span className="text-xs font-normal text-slate-500">/{listing.unit}</span></p>
            <p className="text-xs text-slate-500">Tersedia: {formatNumber(listing.quantity)} {listing.unit}</p>
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-medium text-emerald-700">{listing.sellerName.charAt(0)}</span>
          </div>
          <span className="text-xs text-slate-600">{listing.sellerName}</span>
          {listing.sellerTier === 'CORPORATE' && <ShieldCheck className="w-3 h-3 text-emerald-600 ml-auto" />}
        </div>
      </div>
    </motion.button>
  );
}

/* ============================================
   LISTING DETAIL PAGE
   ============================================ */
function ListingDetailPage() {
  const { selectedListingId, setPage, isAuthenticated } = useStore();
  const listing = MOCK_LISTINGS.find(l => l.id === selectedListingId) || MOCK_LISTINGS[0];
  const cat = WASTE_CATEGORIES[listing.category];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => setPage('marketplace')} className="flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700 mb-6">
        <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Marketplace
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${cat.color}`}>{cat.icon} {cat.label}</span>
                  {listing.isB3 && <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">☢️ B3</span>}
                  {listing.priceTier === 'GOLD' && <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">⭐ Premium</span>}
                </div>
                <h1 className="font-display text-2xl font-bold text-slate-900">{listing.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{listing.city}, {listing.province}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{listing.createdAt}</span>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Deskripsi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* Location Privacy Notice */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-emerald-800">Lokasi Detail Terproteksi</h3>
                <p className="text-sm text-emerald-700 mt-1">Alamat lengkap hanya dapat dilihat setelah Anda melakukan booking dan membayar DP. Ini untuk menjaga keamanan seller.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-full h-32 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs text-emerald-600">Peta kota (lokasi approximate)</p>
                      <p className="text-xs text-emerald-500 mt-1">{listing.city}, {listing.province}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Informasi Seller</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-emerald-700">{listing.sellerName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{listing.sellerName}</p>
                  {listing.sellerTier === 'CORPORATE' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-sm text-slate-500">{listing.sellerTier === 'CORPORATE' ? 'Corporate Member' : listing.sellerTier === 'SMALL_BUSINESS' ? 'Small Business Member' : 'Personal Member'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-slate-700">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-emerald-700">{formatRupiah(listing.pricePerKg)}</p>
              <p className="text-sm text-slate-500">per {listing.unit}</p>
              <p className="text-sm text-slate-600 mt-2">Total tersedia: <span className="font-medium">{formatNumber(listing.quantity)} {listing.unit}</span></p>
              <p className="text-sm font-medium text-slate-900 mt-1">Total: {formatRupiah(listing.pricePerKg * listing.quantity)}</p>
            </div>

            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <button className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                    Mulai Negosiasi
                  </button>
                  <button className="w-full py-3 border border-emerald-200 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-colors">
                    Chat Seller
                  </button>
                </>
              ) : (
                <button onClick={() => setPage('auth')} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                  Masuk untuk Negosiasi
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Transaksi dilindungi escrow</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>DP 30% untuk booking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Lokasi terbuka setelah DP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   DASHBOARD PAGE
   ============================================ */
function DashboardPage() {
  const { currentUser } = useStore();
  const featureGate = useFeatureGate();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'wallet' | 'reports'>('overview');

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Selamat datang kembali, {currentUser.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            currentUser.membershipTier === 'CORPORATE' ? 'bg-amber-100 text-amber-700' :
            currentUser.membershipTier === 'SMALL_BUSINESS' ? 'bg-emerald-100 text-emerald-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {currentUser.membershipTier === 'CORPORATE' ? '⭐ Corporate' : currentUser.membershipTier === 'SMALL_BUSINESS' ? '🟢 Bisnis' : '👤 Personal'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Ringkasan', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'listings', label: 'Listing Saya', icon: <Package className="w-4 h-4" /> },
          { id: 'bookings', label: 'Booking', icon: <Calendar className="w-4 h-4" /> },
          { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
          { id: 'reports', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <DashboardOverview />}
      {activeTab === 'listings' && <DashboardListings />}
      {activeTab === 'bookings' && <DashboardBookings />}
      {activeTab === 'wallet' && <DashboardWallet />}
      {activeTab === 'reports' && <DashboardReports featureGate={featureGate} />}
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transaksi" value="12" change="+3 bulan ini" icon={<Package className="w-5 h-5" />} color="emerald" />
        <StatCard title="Pendapatan" value="Rp 24.5 Jt" change="+18% dari bulan lalu" icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard title="Listing Aktif" value="8" change="2 butuh review" icon={<FileText className="w-5 h-5" />} color="amber" />
        <StatCard title="Rating" value="4.8/5.0" change="23 review" icon={<Star className="w-5 h-5" />} color="purple" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {MOCK_TRANSACTIONS.slice(0, 3).map(tx => (
            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Recycle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{tx.listingTitle}</p>
                <p className="text-xs text-slate-500">{tx.buyerName} → {tx.sellerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{formatRupiah(tx.totalPrice)}</p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${TRANSACTION_STATUS_COLORS[tx.status].bg} ${TRANSACTION_STATUS_COLORS[tx.status].text}`}>
                  {TRANSACTION_STATUS_COLORS[tx.status].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, color }: { title: string; value: string; change: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{change}</p>
    </div>
  );
}

function DashboardListings() {
  const { setPage } = useStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{MOCK_LISTINGS.slice(0, 4).length} listing aktif</p>
        <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" /> Buat Listing Baru
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Listing</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Harga</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LISTINGS.slice(0, 4).map(listing => (
                <tr key={listing.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${WASTE_CATEGORIES[listing.category].color}`}>
                      {WASTE_CATEGORIES[listing.category].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatRupiah(listing.pricePerKg)}/{listing.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${TRANSACTION_STATUS_COLORS[listing.status].bg} ${TRANSACTION_STATUS_COLORS[listing.status].text}`}>
                      {TRANSACTION_STATUS_COLORS[listing.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setPage('listing-detail'); }} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">Lihat →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardBookings() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{MOCK_TRANSACTIONS.length} transaksi</p>
      <div className="grid gap-4">
        {MOCK_TRANSACTIONS.map(tx => (
          <div key={tx.id} className="bg-white rounded-xl border border-slate-200 p-5">
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
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${TRANSACTION_STATUS_COLORS[tx.status].bg} ${TRANSACTION_STATUS_COLORS[tx.status].text}`}>
                  {TRANSACTION_STATUS_COLORS[tx.status].label}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1">
                {['DRAFT', 'NEGOTIATING', 'BOOKED', 'PAID_DP', 'READY_PICKUP', 'COMPLETED'].map((step, i) => {
                  const statusOrder = ['DRAFT', 'PUBLISHED', 'NEGOTIATING', 'BOOKED', 'PAID_DP', 'READY_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'VALIDATED', 'COMPLETED'];
                  const currentIdx = statusOrder.indexOf(tx.status);
                  const stepIdx = statusOrder.indexOf(step);
                  const isActive = stepIdx <= currentIdx;
                  return (
                    <div key={step} className={`flex-1 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
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
          <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">Tarik Dana</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Ditahan Escrow</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rp 5.145.000</p>
          <p className="text-xs text-slate-500 mt-1">2 transaksi aktif</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Total Pendapatan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rp 48.750.000</p>
          <p className="text-xs text-emerald-600 mt-1">+12% bulan ini</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {[
            { type: 'masuk', desc: 'Pembayaran dari PT Green Cycle', amount: 8400000, date: '16 Nov 2024' },
            { type: 'keluar', desc: 'Platform fee (2.5%)', amount: -210000, date: '16 Nov 2024' },
            { type: 'masuk', desc: 'Pembayaran dari Ahmad Wijaya', amount: 8750000, date: '12 Nov 2024' },
            { type: 'keluar', desc: 'Withdrawal ke BCA', amount: -10000000, date: '10 Nov 2024' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'masuk' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {tx.type === 'masuk' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <ArrowRight className="w-4 h-4 text-red-600 rotate-180" />}
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
      </div>
    </div>
  );
}

function DashboardReports({ featureGate }: { featureGate: ReturnType<typeof useFeatureGate> }) {
  if (!featureGate.exportReports) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Fitur Laporan</h3>
        <p className="text-sm text-slate-500 mt-2 mb-4">Upgrade ke paket Small Business atau Corporate untuk mengakses laporan penjualan, pembelian, dan keuangan.</p>
        <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">Upgrade Sekarang</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Laporan</h3>
        <button className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Penjualan Bulanan</h4>
          <div className="space-y-2">
            {['Nov 2024', 'Oct 2024', 'Sep 2024'].map((month, i) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${100 - i * 20}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{formatRupiah([24500000, 18200000, 15800000][i])}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Kategori Terjual</h4>
          <div className="space-y-2">
            {[
              { cat: 'Plastik', pct: 45, amount: 'Rp 11.2 Jt' },
              { cat: 'Logam', pct: 30, amount: 'Rp 7.5 Jt' },
              { cat: 'Tekstil', pct: 15, amount: 'Rp 3.7 Jt' },
              { cat: 'Kertas', pct: 10, amount: 'Rp 2.1 Jt' },
            ].map(item => (
              <div key={item.cat} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.pct}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ============================================
   AUTH PAGE
   ============================================ */
function AuthPage() {
  const { login, register, setPage } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const success = login(email, password);
      if (success) {
        setPage('dashboard');
      } else {
        setError('Email atau password salah. Coba: budi@plastikjaya.com atau admin@bursalimbah.com');
      }
    } else {
      if (!name || !email || !password) {
        setError('Semua field harus diisi');
        return;
      }
      register({ name, email });
      setPage('dashboard');
    }
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

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap / Perusahaan</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="PT Contoh Indonesia" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@perusahaan.com" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              {isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-1">Demo accounts:</p>
              <p className="text-xs text-slate-600">• budi@plastikjaya.com (Seller, Bisnis)</p>
              <p className="text-xs text-slate-600">• admin@bursalimbah.com (Admin)</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              {isLogin ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          Dengan mendaftar, Anda menyetujui <button onClick={() => setPage('terms')} className="text-emerald-600 hover:underline">Syarat & Ketentuan</button> dan <button onClick={() => setPage('privacy')} className="text-emerald-600 hover:underline">Kebijakan Privasi</button> kami.
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================
   ADMIN PAGE
   ============================================ */
function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-600">Kelola platform BursaLimbah</p>
      </div>

      {/* Admin Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-600">Total User</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">2,847</p>
          <p className="text-xs text-emerald-600 mt-1">+124 minggu ini</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-600">Listing Aktif</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">12,543</p>
          <p className="text-xs text-amber-600 mt-1">18 butuh moderasi</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-600">Transaksi Hari Ini</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">87</p>
          <p className="text-xs text-emerald-600 mt-1">+15% dari kemarin</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-600">Revenue Platform</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Rp 124 Jt</p>
          <p className="text-xs text-emerald-600 mt-1">Bulan ini</p>
        </div>
      </div>

      {/* Admin sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Listing Perlu Moderasi
          </h3>
          <div className="space-y-3">
            {MOCK_LISTINGS.filter(l => l.isB3).map(listing => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                  <p className="text-xs text-slate-500">{listing.sellerName} • {listing.city}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200">Approve</button>
                  <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> User Terbaru
          </h3>
          <div className="space-y-3">
            {MOCK_USERS.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-700">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user.isVerified ? '✓ Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PRICING PAGE
   ============================================ */
function PricingPage() {
  const { setPage } = useStore();

  const plans = [
    {
      name: 'Personal',
      price: 'Gratis',
      description: 'Untuk individu dan pemula',
      features: ['5 listing aktif', '20 negosiasi/bulan', 'AI Chat (basic)', 'Escrow protection', 'Rating & review'],
      cta: 'Mulai Gratis',
      highlighted: false,
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Small Business',
      price: 'Rp 299.000',
      period: '/bulan',
      description: 'Untuk UMKM dan pengepul',
      features: ['25 listing aktif', '100 negosiasi/bulan', 'AI Chat (full)', 'Riwayat buyer/seller', 'Bulk upload', 'Export laporan PDF/Excel', 'Priority support'],
      cta: 'Pilih Bisnis',
      highlighted: true,
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Corporate',
      price: 'Rp 999.000',
      period: '/bulan',
      description: 'Untuk perusahaan besar & industri',
      features: ['Unlimited listing', 'Unlimited negosiasi', 'AI Chat + custom prompts', 'Priority listing placement', 'Dedicated account manager', 'API access', 'Custom SLA escrow', 'Price tier Gold visible', 'PPh 23 support'],
      cta: 'Hubungi Sales',
      highlighted: false,
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">Paket Membership</h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Pilih paket yang sesuai dengan skala bisnis Anda. Upgrade kapan saja untuk membuka fitur lebih lengkap.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlighted ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20 scale-105' : 'bg-white border border-slate-200'}`}>
            {plan.highlighted && (
              <div className="text-center mb-4">
                <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">POPULER</span>
              </div>
            )}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.highlighted ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}>
              {plan.icon}
            </div>
            <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            <p className={`text-sm mt-1 ${plan.highlighted ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.description}</p>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.period && <span className={`text-sm ${plan.highlighted ? 'text-emerald-200' : 'text-slate-500'}`}>{plan.period}</span>}
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <span className={plan.highlighted ? 'text-emerald-50' : 'text-slate-700'}>{feature}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setPage('auth')} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${plan.highlighted ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-center text-slate-900 mb-8">Perbandingan Fitur</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                  <td className="px-4 py-3 text-center text-emerald-700 font-medium">{business}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{corporate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        {type === 'terms' ? (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Syarat & Ketentuan</h1>
            <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 1 November 2024</p>
            <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">1. Ketentuan Umum</h2>
                <p>BursaLimbah.com adalah platform marketplace yang mempertemukan penjual dan pembeli limbah di Indonesia. Dengan menggunakan layanan ini, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini sesuai dengan KUHPerdata.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">2. Pendaftaran & KYC</h2>
                <p>Untuk menggunakan fitur lengkap, pengguna wajib melakukan verifikasi identitas (KYC). Untuk tier Corporate, diperlukan verifikasi NPWP, NIB, dan izin lingkungan untuk penanganan limbah B3 sesuai regulasi KLHK.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">3. Transaksi & Escrow</h2>
                <p>Setiap transaksi dilindungi sistem escrow. Dana pembeli ditahan hingga barang diterima dan divalidasi. Platform fee berkisar 2-5% tergantung tier membership. Dana akan di-release maksimal 7 hari setelah pickup.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">4. Limbah B3</h2>
                <p>Perdagangan limbah B3 (Bahan Berbahaya dan Beracun) hanya dapat dilakukan oleh pihak yang memiliki izin resmi dari KLHK. BursaLimbah berhak menolak atau menghapus listing yang tidak memenuhi syarat regulasi PP No. 22/2021.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">5. Penyelesaian Sengketa</h2>
                <p>Sengketa akan dimediasi oleh tim BursaLimbah dalam waktu 3x24 jam. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui BAPSI atau jalur hukum yang berlaku di Indonesia.</p>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Kebijakan Privasi</h1>
            <p className="text-sm text-slate-500 mb-8">Compliant dengan UU PDP No. 27/2023 • Terakhir diperbarui: 1 November 2024</p>
            <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">1. Pengumpulan Data</h2>
                <p>Kami mengumpulkan data pribadi yang diperlukan untuk operasional platform: nama, email, nomor telepon, alamat usaha, dan data transaksi. Data lokasi GPS dienkripsi menggunakan AES-256-GCM.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">2. Penggunaan Data</h2>
                <p>Data digunakan untuk: memproses transaksi, memverifikasi identitas, meningkatkan layanan, dan komunikasi terkait transaksi. Kami tidak menjual data pribadi kepada pihak ketiga.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">3. Perlindungan Data Lokasi</h2>
                <p>Koordinat GPS seller disimpan dalam bentuk terenkripsi. Hanya kota dan provinsi yang ditampilkan ke publik. Lokasi detail hanya terbuka setelah transaksi dikonfirmasi dan DP dibayar.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">4. Hak Pengguna (UU PDP)</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hak mengakses data pribadi yang disimpan</li>
                  <li>Hak memperbaiki data yang tidak akurat</li>
                  <li>Hak menghapus data (right to be forgotten)</li>
                  <li>Hak portabilitas data</li>
                  <li>Hak menarik persetujuan (consent)</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-900">5. Retensi Data</h2>
                <p>Data transaksi disimpan selama 10 tahun sesuai ketentuan perpajakan. Data pribadi lainnya dihapus dalam 30 hari setelah permintaan penghapusan atau penutupan akun.</p>
              </section>
            </div>
          </>
        )}
      </div>
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: 'Anda',
      content: input,
      isAI: false,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        'Baik, saya akan membantu Anda mencari listing yang sesuai. Berdasarkan kriteria Anda, ada beberapa opsi yang menarik. Mau saya tampilkan detailnya?',
        'Untuk limbah plastik PP di area Jawa Timur, harga pasar saat ini berkisar Rp 3.500 - 5.500/kg tergantung grade dan kebersihan material.',
        'Saya bisa membantu Anda membuat listing baru. Silakan upload foto limbah Anda dan saya akan generate judul, kategori, dan estimasi harga secara otomatis.',
        'Untuk transaksi limbah B3, pastikan Anda memiliki izin pengolahan dari KLHK. Saya bisa membantu memverifikasi kelengkapan dokumen Anda.',
        'Berdasarkan riwayat transaksi Anda, saya merekomendasikan untuk negosiasi di harga Rp 4.200/kg. Ini 7% di bawah harga listing tapi masih dalam range pasar.',
      ];
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        senderId: 'ai',
        senderName: 'Asisten BursaLimbah',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isAI: true,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Asisten AI</p>
                  <p className="text-xs text-emerald-200">Online • Siap membantu</p>
                </div>
              </div>
              <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.isAI ? 'bg-slate-100 text-slate-800 rounded-bl-md' : 'bg-emerald-600 text-white rounded-br-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.toolCalls && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50">
                        <p className="text-xs opacity-60">🔧 {msg.toolCalls[0].name}()</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanya apa saja tentang limbah..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button onClick={handleSend} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">AI bisa salah. Verifikasi info penting secara mandiri.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          chatOpen ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse-glow'
        }`}
      >
        {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>
    </div>
  );
}

/* ============================================
   FOOTER
   ============================================ */
function Footer() {
  const { setPage } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Recycle className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">BursaLimbah</span>
            </div>
            <p className="text-sm text-slate-400">Marketplace perdagangan limbah terpercaya di Indonesia. Aman, transparan, dan compliant regulasi.</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-medium text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setPage('marketplace')} className="hover:text-emerald-400 transition-colors">Marketplace</button></li>
              <li><button onClick={() => setPage('pricing')} className="hover:text-emerald-400 transition-colors">Harga</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Cara Kerja</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">API Documentation</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setPage('terms')} className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</button></li>
              <li><button onClick={() => setPage('privacy')} className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Regulasi Limbah</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Mekanisme Sengketa</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@bursalimbah.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +62 21-5555-BURS</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Jakarta, Indonesia</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-xs">IG</span>
              </div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-xs">LI</span>
              </div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-xs">WA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2024 BursaLimbah.com. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> UU PDP Compliant</span>
            <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> Eco-Friendly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
