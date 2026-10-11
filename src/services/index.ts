/**
 * BursaLimbah.com - Service Layer
 * Simulates backend services (Auth, Payment, Shipping, AI, Maps)
 * In production, these would be Next.js API Routes + tRPC
 */

import { Listing, Transaction, User, MembershipTier, WasteCategory, TransactionStatus } from '../types';
import { MOCK_LISTINGS, MOCK_TRANSACTIONS } from '../data';

/* ============================================
   AUTH SERVICE (simulates NextAuth.js v5)
   ============================================ */
export const AuthService = {
  /** Rate-limited login (5 attempts / 15 min) */
  _attempts: 0,
  _lockUntil: 0,

  async login(email: string, _password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Rate limiting simulation
    if (Date.now() < this._lockUntil) {
      return { success: false, error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' };
    }

    await this.delay(800);

    const users: Record<string, User> = {
      'budi@plastikjaya.com': {
        id: 'u1', name: 'Budi Santoso', email: 'budi@plastikjaya.com',
        phone: '+62 812-3456-7890', role: 'SELLER', membershipTier: 'SMALL_BUSINESS',
        city: 'Surabaya', province: 'Jawa Timur', isVerified: true, createdAt: '2024-01-15',
        npwp: '01.234.567.8-901.000', kycStatus: 'VERIFIED',
      },
      'siti@greencycle.id': {
        id: 'u2', name: 'Siti Rahayu', email: 'siti@greencycle.id',
        phone: '+62 813-9876-5432', role: 'BUYER', membershipTier: 'CORPORATE',
        city: 'Jakarta', province: 'DKI Jakarta', isVerified: true, createdAt: '2024-02-20',
        npwp: '02.345.678.9-012.000', kycStatus: 'VERIFIED',
      },
      'ahmad@personal.com': {
        id: 'u3', name: 'Ahmad Wijaya', email: 'ahmad@personal.com',
        phone: '+62 857-1234-5678', role: 'USER', membershipTier: 'PERSONAL',
        city: 'Bandung', province: 'Jawa Barat', isVerified: false, createdAt: '2024-03-10',
        kycStatus: 'PENDING',
      },
      'admin@bursalimbah.com': {
        id: 'admin', name: 'Admin BursaLimbah', email: 'admin@bursalimbah.com',
        phone: '+62 21-5555-0000', role: 'ADMIN', membershipTier: 'CORPORATE',
        city: 'Jakarta', province: 'DKI Jakarta', isVerified: true, createdAt: '2024-01-01',
        kycStatus: 'VERIFIED',
      },
    };

    const user = users[email];
    if (user) {
      this._attempts = 0;
      return { success: true, user };
    }

    this._attempts++;
    if (this._attempts >= 5) {
      this._lockUntil = Date.now() + 15 * 60 * 1000;
      return { success: false, error: 'Akun dikunci sementara. Terlalu banyak percobaan gagal.' };
    }
    return { success: false, error: `Email atau password salah. (${5 - this._attempts} percobaan tersisa)` };
  },

  async register(data: Partial<User>): Promise<User> {
    await this.delay(1000);
    return {
      id: `u_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: 'USER',
      membershipTier: 'PERSONAL',
      city: data.city || '',
      province: data.province || '',
      isVerified: false,
      createdAt: new Date().toISOString(),
      kycStatus: 'NOT_STARTED',
    };
  },

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

/* ============================================
   PAYMENT SERVICE (simulates Midtrans Snap)
   ============================================ */
export const PaymentService = {
  async createTransaction(params: {
    listingId: string;
    quantity: number;
    pricePerKg: number;
    dpPercentage: number;
  }): Promise<{
    transactionId: string;
    dpAmount: number;
    totalAmount: number;
    snapToken: string;
    expiryTime: string;
  }> {
    await AuthService.delay(1200);
    const totalAmount = params.quantity * params.pricePerKg;
    const dpAmount = Math.round(totalAmount * (params.dpPercentage / 100));
    const platformFee = Math.round(totalAmount * 0.025); // 2.5%

    return {
      transactionId: `TXN-${Date.now()}`,
      dpAmount,
      totalAmount: totalAmount + platformFee,
      snapToken: `SNAP-${Math.random().toString(36).substring(2, 15)}`,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async verifyPayment(transactionId: string): Promise<{ status: 'success' | 'pending' | 'failed'; orderId: string }> {
    await AuthService.delay(1500);
    return {
      status: 'success',
      orderId: `ORD-${transactionId.split('-')[1]}`,
    };
  },

  async releaseEscrow(transactionId: string): Promise<{ released: boolean; amount: number; fee: number }> {
    await AuthService.delay(1000);
    return {
      released: true,
      amount: 8400000,
      fee: 210000,
    };
  },
};

/* ============================================
   SHIPPING SERVICE (simulates RajaOngkir)
   ============================================ */
export const ShippingService = {
  async getShippingCost(params: {
    origin: string;
    destination: string;
    weight: number; // in grams
  }): Promise<Array<{
    courier: string;
    service: string;
    cost: number;
    estimate: string;
  }>> {
    await AuthService.delay(800);
    const baseCost = params.weight * 2.5; // Rp 2.5/gram base
    const distanceMultiplier = params.origin === params.destination ? 1 : 1.5;

    return [
      { courier: 'JNE', service: 'REG', cost: Math.round(baseCost * distanceMultiplier), estimate: '2-3 hari' },
      { courier: 'JNE', service: 'YES', cost: Math.round(baseCost * distanceMultiplier * 1.8), estimate: '1 hari' },
      { courier: 'SiCepat', service: 'HALU', cost: Math.round(baseCost * distanceMultiplier * 0.9), estimate: '2-4 hari' },
      { courier: 'Anteraja', service: 'REG', cost: Math.round(baseCost * distanceMultiplier * 0.85), estimate: '3-5 hari' },
    ];
  },

  async trackShipment(waybill: string): Promise<{
    status: string;
    history: Array<{ date: string; desc: string; location: string }>;
  }> {
    await AuthService.delay(600);
    return {
      status: 'In Transit',
      history: [
        { date: '2024-11-18 08:00', desc: 'Pickup dari seller', location: 'Surabaya' },
        { date: '2024-11-18 14:00', desc: 'Dalam perjalanan ke hub', location: 'Surabaya Hub' },
        { date: '2024-11-19 06:00', desc: 'Transit di hub utama', location: 'Jakarta Hub' },
      ],
    };
  },
};

/* ============================================
   AI AGENT SERVICE (simulates OpenAI GPT-4o)
   ============================================ */
export const AIAgentService = {
  systemPrompt: `Anda adalah asisten AI BursaLimbah, ahli dalam perdagangan limbah di Indonesia.
Pengetahuan Anda mencakup:
- Kategori limbah (plastik, kertas, logam, elektronik, organik, B3, industri, tekstil, konstruksi)
- Harga pasar limbah di Indonesia (update November 2024)
- Regulasi KLHK terkait limbah B3 dan non-B3
- Proses transaksi yang aman dengan escrow
- Tips negosiasi untuk seller dan buyer

Selalu respons dalam Bahasa Indonesia. Gunakan emoji untuk memperjelas.
Jika user bertanya tentang harga, berikan range harga pasar.
Jika user ingin membuat listing, bantu generate judul dan estimasi harga.`,

  tools: {
    searchListings: (filters: { category?: string; province?: string; maxPrice?: number }) => {
      let results = MOCK_LISTINGS;
      if (filters.category) results = results.filter(l => l.category === filters.category);
      if (filters.province) results = results.filter(l => l.province.includes(filters.province!));
      if (filters.maxPrice) results = results.filter(l => l.pricePerKg <= filters.maxPrice!);
      return results.slice(0, 5);
    },

    calculatePrice: (category: string, quantity: number) => {
      const basePrices: Record<string, number> = {
        PLASTIC: 4500, PAPER: 2800, METAL: 18000, ELECTRONIC: 85000,
        ORGANIC: 800, B3: 5500, INDUSTRIAL: 3500, TEXTILE: 3200, CONSTRUCTION: 350,
      };
      const base = basePrices[category] || 3000;
      const discount = quantity > 1000 ? 0.9 : quantity > 500 ? 0.95 : 1;
      return {
        estimatedPrice: Math.round(base * discount),
        priceRange: { min: Math.round(base * 0.8), max: Math.round(base * 1.2) },
        totalEstimate: Math.round(base * discount * quantity),
      };
    },

    getWasteRegulation: (wasteType: string) => {
      const regulations: Record<string, { permit: string; regulation: string; notes: string }> = {
        B3: { permit: 'Izin KLHK + Manifest B3', regulation: 'PP No. 22/2021', notes: 'Wajib transporter berizin' },
        PLASTIC: { permit: 'Tidak diperlukan (non-B3)', regulation: 'PermenLHK P.75/2019', notes: 'Dokumentasi asal limbah' },
        ELECTRONIC: { permit: 'Izin pengolahan e-waste', regulation: 'PermenLHK P.22/2021', notes: 'Wajib pelaporan ke SIPSN' },
      };
      return regulations[wasteType] || { permit: 'Standar', regulation: 'UU No. 18/2008', notes: 'Tidak ada syarat khusus' };
    },

    exportToMaps: (city: string, province: string) => {
      return `https://www.google.com/maps/search/${encodeURIComponent(city + ', ' + province)}`;
    },
  },

  async chat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context?: {
    userId?: string;
    currentListingId?: string;
    userTier?: MembershipTier;
  }): Promise<{
    content: string;
    toolCalls?: Array<{ name: string; args: Record<string, unknown>; result?: unknown }>;
  }> {
    await AuthService.delay(1000 + Math.random() * 1000);

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Simple intent detection for tool calling
    if (lastMessage.includes('cari') || lastMessage.includes('temukan') || lastMessage.includes('listing')) {
      const category = Object.keys(this.tools.searchListings({})).find(c =>
        lastMessage.includes(c.toLowerCase())
      );
      const result = this.tools.searchListings({ category: category as WasteCategory });
      return {
        content: `Saya menemukan ${result.length} listing yang cocok:\n\n${result.map((l, i) => `${i + 1}. **${l.title}**\n   📍 ${l.city}, ${l.province}\n   💰 ${formatRupiah(l.pricePerKg)}/${l.unit}\n   📦 ${formatNumber(l.quantity)} ${l.unit} tersedia`).join('\n\n')}\n\nMau saya bantu negosiasi atau booking salah satunya?`,
        toolCalls: [{ name: 'searchListings', args: { category }, result }],
      };
    }

    if (lastMessage.includes('harga') || lastMessage.includes('estimasi') || lastMessage.includes('berapa')) {
      const result = this.tools.calculatePrice('PLASTIC', 1000);
      return {
        content: `Berdasarkan data pasar saat ini:\n\n💰 **Estimasi Harga: ${formatRupiah(result.estimatedPrice)}/kg**\n📊 Range: ${formatRupiah(result.priceRange.min)} - ${formatRupiah(result.priceRange.max)}/kg\n📦 Total estimasi (1000 kg): ${formatRupiah(result.totalEstimate)}\n\nHarga bisa bervariasi tergantung grade, kebersihan, dan volume. Mau saya bantu buat listing dengan harga ini?`,
        toolCalls: [{ name: 'calculatePrice', args: { category: 'PLASTIC', quantity: 1000 }, result }],
      };
    }

    if (lastMessage.includes('regulasi') || lastMessage.includes('izin') || lastMessage.includes('b3') || lastMessage.includes('klhk')) {
      const result = this.tools.getWasteRegulation('B3');
      return {
        content: `📋 **Regulasi Limbah B3:**\n\n🔐 Permit: ${result.permit}\n📜 Regulasi: ${result.regulation}\n⚠️ Catatan: ${result.notes}\n\nPastikan Anda memiliki izin yang valid sebelum melakukan transaksi limbah B3. Mau saya cek kelengkapan dokumen Anda?`,
        toolCalls: [{ name: 'getWasteRegulation', args: { wasteType: 'B3' }, result }],
      };
    }

    if (lastMessage.includes('maps') || lastMessage.includes('lokasi') || lastMessage.includes('alamat')) {
      const result = this.tools.exportToMaps('Surabaya', 'Jawa Timur');
      return {
        content: `📍 Lokasi tersedia setelah booking dan pembayaran DP.\n\n🔗 Link Maps: ${result}\n\n⚠️ Lokasi detail hanya dibuka untuk buyer yang sudah menyelesaikan DP. Ini untuk menjaga keamanan seller.`,
        toolCalls: [{ name: 'exportToMaps', args: { city: 'Surabaya', province: 'Jawa Timur' }, result }],
      };
    }

    // Default responses
    const responses = [
      'Saya siap membantu Anda! 🌿 Saya bisa membantu mencari listing limbah, menghitung estimasi harga, mengecek regulasi, atau memandu proses transaksi. Apa yang Anda butuhkan?',
      'Tentu! Untuk memulai, Anda bisa:\n\n1. 🔍 **Cari limbah** - "Cari limbah plastik di Jawa Timur"\n2. 💰 **Cek harga** - "Berapa harga limbah aluminium?"\n3. 📋 **Cek regulasi** - "Apa syarat jual limbah B3?"\n4. 📍 **Lihat lokasi** - "Tampilkan lokasi di Maps"\n\nSilakan pilih atau ketik pertanyaan Anda!',
      'Baik, saya catat permintaan Anda. Berdasarkan analisis pasar saat ini, ini adalah waktu yang baik untuk transaksi. Mau saya bantu proses lebih lanjut?',
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
    };
  },
};

/* ============================================
   LOCATION SERVICE (AES-256-GCM simulation)
   ============================================ */
export const LocationService = {
  /** Simulate AES-256-GCM encryption */
  encryptCoords(lat: number, lng: number): string {
    const data = `${lat}:${lng}`;
    return btoa(data).split('').reverse().join('');
  },

  /** Decrypt coordinates (only when authorized) */
  decryptCoords(encrypted: string): { lat: number; lng: number } | null {
    try {
      const data = atob(encrypted.split('').reverse().join(''));
      const [lat, lng] = data.split(':').map(Number);
      return { lat, lng };
    } catch {
      return null;
    }
  },

  /** Get city centroid for map display (public) */
  getCityCentroid(city: string): { lat: number; lng: number } {
    const centroids: Record<string, { lat: number; lng: number }> = {
      'Surabaya': { lat: -7.2575, lng: 112.7521 },
      'Jakarta': { lat: -6.2088, lng: 106.8456 },
      'Bandung': { lat: -6.9175, lng: 107.6191 },
      'Medan': { lat: 3.5952, lng: 98.6722 },
      'Semarang': { lat: -6.9667, lng: 110.4167 },
      'Solo': { lat: -7.5755, lng: 110.8243 },
      'Bekasi': { lat: -6.2349, lng: 106.9896 },
      'Tangerang': { lat: -6.1781, lng: 106.6319 },
      'Cikarang': { lat: -6.3039, lng: 107.1744 },
      'Karawang': { lat: -6.3227, lng: 107.3376 },
    };
    return centroids[city] || { lat: -2.5, lng: 118.0 }; // Indonesia center
  },

  /** Generate Google Maps URL from coords */
  generateMapsUrl(lat: number, lng: number, label?: string): string {
    const params = new URLSearchParams({
      query: label || `${lat},${lng}`,
      api: '1',
    });
    return `https://www.google.com/maps?${params.toString()}`;
  },

  /** Generate Waze URL */
  generateWazeUrl(lat: number, lng: number): string {
    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  },
};

/* ============================================
   KYC SERVICE
   ============================================ */
export const KYCService = {
  async submitKTP(data: { name: string; nik: string; photo: string }): Promise<{
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    message: string;
  }> {
    await AuthService.delay(2000);
    return { status: 'PENDING', message: 'KTP sedang diverifikasi. Estimasi 1x24 jam.' };
  },

  async submitNPWP(data: { npwp: string; document: string }): Promise<{
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    message: string;
  }> {
    await AuthService.delay(1500);
    return { status: 'PENDING', message: 'NPWP sedang diverifikasi dengan DJP.' };
  },

  async submitNIB(data: { nib: string; document: string }): Promise<{
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    message: string;
  }> {
    await AuthService.delay(1500);
    return { status: 'PENDING', message: 'NIB sedang diverifikasi dengan OSS.' };
  },

  async checkEnvironmentalPermit(data: { permitNumber: string }): Promise<{
    valid: boolean;
    issuer: string;
    expiryDate: string;
  }> {
    await AuthService.delay(1000);
    return {
      valid: true,
      issuer: 'KLHK',
      expiryDate: '2025-12-31',
    };
  },
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
