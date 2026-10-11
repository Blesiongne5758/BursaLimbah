/**
 * BursaLimbah.com - Landing Page
 * Hero section, features, categories, privacy, testimonials
 */

import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Card, Badge } from '../components/ui';
import {
  Recycle, Search, MessageCircle, CreditCard, Truck, Lock, ShieldCheck,
  Scale, Leaf, Award, Sparkles, Check, ArrowRight, Star, Bot
} from 'lucide-react';
import { WASTE_CATEGORIES, type WasteCategory } from '../types';

export default function LandingPage() {
  const { setPage } = useStore();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
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
                <button onClick={() => setPage('marketplace')} className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all">
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

      {/* Categories */}
      <section className="py-20 bg-slate-50">
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
      <section className="py-20 bg-white">
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
                    <span className="text-xs font-medium text-slate-600">👁️ Yang Dilihat Publik</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">Dipercaya Ribuan Pelaku Usaha</h2>
            <p className="text-slate-600 mt-3">Apa kata mereka tentang BursaLimbah</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Hendra K.', role: 'Owner, CV Plastik Mandiri', text: 'Sejak pakai BursaLimbah, penjualan limbah plastik kami naik 40%. Escrow system membuat buyer lebih percaya.', rating: 5 },
              { name: 'Diana S.', role: 'Procurement, PT Recycle Indonesia', text: 'AI assistant sangat membantu mencari supplier. Negosiasi jadi lebih efisien, harga lebih kompetitif.', rating: 5 },
              { name: 'Rudi W.', role: 'Manager, UD Kertas Sejahtera', text: 'Fitur privasi lokasi sangat penting untuk keamanan gudang kami. Hanya buyer yang sudah bayar DP yang bisa lihat alamat.', rating: 4 },
            ].map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
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
