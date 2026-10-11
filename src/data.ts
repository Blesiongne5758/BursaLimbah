/**
 * BursaLimbah.com - Mock Data
 * Aligned with Prisma schema (PostgreSQL)
 */

import { Listing, Booking, User, ChatMessage } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1', name: 'Budi Santoso', email: 'budi@plastikjaya.com',
    phone: '+62 812-3456-7890', role: 'SELLER', membershipTier: 'SMALL_BUSINESS',
    kycStatus: 'VERIFIED', city: 'Surabaya', province: 'Jawa Timur',
    createdAt: '2024-01-15', isVerified: true,
    companyInfo: { userId: 'u1', companyName: 'PT Plastik Jaya', npwp: '01.234.567.8-901.000', nib: '1234567890123', businessLicense: 'SKT-2024-001', industrySector: 'Daur Ulang Plastik' },
  },
  {
    id: 'u2', name: 'Siti Rahayu', email: 'siti@greencycle.id',
    phone: '+62 813-9876-5432', role: 'BUYER', membershipTier: 'CORPORATE',
    kycStatus: 'VERIFIED', city: 'Jakarta', province: 'DKI Jakarta',
    createdAt: '2024-02-20', isVerified: true,
    companyInfo: { userId: 'u2', companyName: 'PT Green Cycle Indonesia', npwp: '02.345.678.9-012.000', nib: '9876543210987', businessLicense: 'SKT-2024-002', industrySector: 'Recycling' },
  },
  {
    id: 'u3', name: 'Ahmad Wijaya', email: 'ahmad@personal.com',
    phone: '+62 857-1234-5678', role: 'USER', membershipTier: 'PERSONAL',
    kycStatus: 'PENDING', city: 'Bandung', province: 'Jawa Barat',
    createdAt: '2024-03-10', isVerified: false,
  },
];

/** Inline location helpers */
const cityCoords: Record<string, { lat: number; lng: number }> = {
  'Surabaya': { lat: -7.2575, lng: 112.7521 }, 'Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Bandung': { lat: -6.9175, lng: 107.6191 }, 'Medan': { lat: 3.5952, lng: 98.6722 },
  'Semarang': { lat: -6.9667, lng: 110.4167 }, 'Solo': { lat: -7.5755, lng: 110.8243 },
  'Bekasi': { lat: -6.2349, lng: 106.9896 }, 'Tangerang': { lat: -6.1781, lng: 106.6319 },
  'Cikarang': { lat: -6.3039, lng: 107.1744 }, 'Karawang': { lat: -6.3227, lng: 107.3376 },
};
function encryptCoords(lat: number, lng: number): string { return btoa(`${lat}:${lng}`).split('').reverse().join(''); }

/** Helper to create listing with encrypted coords */
function makeListing(partial: Partial<Listing> & { id: string; title: string; description: string; category: Listing['category']; pricePerKg: number; quantity: number; unit: string; city: string; province: string; sellerId: string; sellerName: string; sellerTier: Listing['sellerTier']; status: Listing['status']; priceTier: Listing['priceTier']; createdAt: string }): Listing {
  const coords = cityCoords[partial.city] || { lat: -2.5, lng: 118 };
  return {
    id: partial.id, title: partial.title, description: partial.description,
    category: partial.category, subCategory: partial.category,
    quantity: partial.quantity, unit: partial.unit,
    basePrice: partial.pricePerKg, pricePerKg: partial.pricePerKg,
    negotiable: true, city: partial.city, province: partial.province,
    encryptedCoords: encryptCoords(coords.lat, coords.lng),
    locationHash: `hash_${partial.id}_${partial.city}`,
    sellerId: partial.sellerId, sellerName: partial.sellerName, sellerTier: partial.sellerTier,
    status: partial.status, aiGenerated: false, priceTier: partial.priceTier,
    createdAt: partial.createdAt, isB3: partial.category === 'B3', images: [],
  };
}

export const MOCK_LISTINGS: Listing[] = [
  makeListing({
    id: 'l1', title: 'Limbah Plastik PP Grade A - 5 Ton',
    description: 'Limbah plastik PP dari pabrik kemasan makanan. Kondisi bersih, sudah dicacah. Cocok untuk daur ulang menjadi pellet.',
    category: 'PLASTIC', pricePerKg: 4500, quantity: 5000, unit: 'kg',
    city: 'Surabaya', province: 'Jawa Timur', sellerId: 'u1', sellerName: 'PT Plastik Jaya', sellerTier: 'SMALL_BUSINESS',
    status: 'PUBLISHED', priceTier: 'SILVER', createdAt: '2024-11-01',
  }),
  makeListing({
    id: 'l2', title: 'Karton Bekas Campur - 10 Ton',
    description: 'Karton bekas dari gudang logistik. Campuran kardus coklat dan putih. Sudah dipisahkan dari material non-kertas.',
    category: 'PAPER', pricePerKg: 2800, quantity: 10000, unit: 'kg',
    city: 'Bekasi', province: 'Jawa Barat', sellerId: 'u1', sellerName: 'CV Kertas Makmur', sellerTier: 'SMALL_BUSINESS',
    status: 'PUBLISHED', priceTier: 'BRONZE', createdAt: '2024-11-05',
  }),
  makeListing({
    id: 'l3', title: 'Scrap Aluminium Can - 2 Ton',
    description: 'Bekas kaluminium minuman. Sudah dipres dalam bal. Kadar aluminium 95%+.',
    category: 'METAL', pricePerKg: 18000, quantity: 2000, unit: 'kg',
    city: 'Tangerang', province: 'Banten', sellerId: 'u2', sellerName: 'PT Metal Recycle Indonesia', sellerTier: 'CORPORATE',
    status: 'PUBLISHED', priceTier: 'GOLD', createdAt: '2024-11-08',
  }),
  makeListing({
    id: 'l4', title: 'E-Waste PCB Board - 500 Kg',
    description: 'Papan sirkuit dari limbah elektronik pabrik. Mengandung tembaga, emas, dan logam mulia.',
    category: 'ELECTRONIC', pricePerKg: 85000, quantity: 500, unit: 'kg',
    city: 'Cikarang', province: 'Jawa Barat', sellerId: 'u2', sellerName: 'PT E-Waste Solutions', sellerTier: 'CORPORATE',
    status: 'PUBLISHED', priceTier: 'GOLD', createdAt: '2024-11-10',
  }),
  makeListing({
    id: 'l5', title: 'Ampas Kelapa Sawit - 20 Ton',
    description: 'Limbah organik dari pabrik CPO. Kadar air 60%. Cocok untuk pupuk kompos atau biogas.',
    category: 'ORGANIC', pricePerKg: 800, quantity: 20000, unit: 'kg',
    city: 'Medan', province: 'Sumatera Utara', sellerId: 'u3', sellerName: 'PT Sawit Nusantara', sellerTier: 'CORPORATE',
    status: 'PUBLISHED', priceTier: 'SILVER', createdAt: '2024-11-12',
  }),
  makeListing({
    id: 'l6', title: 'Kain Perca Tekstil - 3 Ton',
    description: 'Limbah kain dari konveksi garment. Campuran katun dan polyester. Cocok untuk industri lap.',
    category: 'TEXTILE', pricePerKg: 3200, quantity: 3000, unit: 'kg',
    city: 'Solo', province: 'Jawa Tengah', sellerId: 'u1', sellerName: 'CV Tekstil Mandiri', sellerTier: 'SMALL_BUSINESS',
    status: 'NEGOTIATING', priceTier: 'BRONZE', createdAt: '2024-11-14',
  }),
  makeListing({
    id: 'l7', title: 'Limbah Beton & Bata - 50 Ton',
    description: 'Sisa material konstruksi dari proyek pembongkaran gedung. Beton bertulang dan bata merah.',
    category: 'CONSTRUCTION', pricePerKg: 350, quantity: 50000, unit: 'kg',
    city: 'Semarang', province: 'Jawa Tengah', sellerId: 'u2', sellerName: 'PT Konstruksi Abadi', sellerTier: 'CORPORATE',
    status: 'PUBLISHED', priceTier: 'BRONZE', createdAt: '2024-11-15',
  }),
  makeListing({
    id: 'l8', title: 'Limbah B3 Oli Bekas - 1000 Liter',
    description: 'Oli bekas dari bengkel industri. Memerlukan izin KLHK untuk penanganan. Tersedia MSDS.',
    category: 'B3', pricePerKg: 5500, quantity: 1000, unit: 'liter',
    city: 'Karawang', province: 'Jawa Barat', sellerId: 'u2', sellerName: 'PT B3 Handling Indonesia', sellerTier: 'CORPORATE',
    status: 'PUBLISHED', priceTier: 'GOLD', createdAt: '2024-11-16',
  }),
];

export const MOCK_TRANSACTIONS: Booking[] = [
  {
    id: 't1', listingId: 'l1', listingTitle: 'Limbah Plastik PP Grade A - 5 Ton',
    buyerId: 'u2', sellerId: 'u1', buyerName: 'PT Green Cycle', sellerName: 'PT Plastik Jaya',
    quantity: 2000, pricePerKg: 4200, totalPrice: 8400000, downPayment: 2520000,
    paymentMethod: 'MIDTRANS', escrowStatus: 'HOLD', pickupMethod: 'COURIER',
    status: 'PAID_DP', createdAt: '2024-11-10', estimatedPickup: '2024-11-20', pickupDate: '2024-11-20',
  },
  {
    id: 't2', listingId: 'l3', listingTitle: 'Scrap Aluminium Can - 2 Ton',
    buyerId: 'u3', sellerId: 'u2', buyerName: 'Ahmad Wijaya', sellerName: 'PT Metal Recycle',
    quantity: 500, pricePerKg: 17500, totalPrice: 8750000, downPayment: 2625000,
    paymentMethod: 'MIDTRANS', escrowStatus: 'HOLD', pickupMethod: 'SELF',
    status: 'READY_PICKUP', createdAt: '2024-11-12', estimatedPickup: '2024-11-22', pickupDate: '2024-11-22',
  },
  {
    id: 't3', listingId: 'l6', listingTitle: 'Kain Perca Tekstil - 3 Ton',
    buyerId: 'u2', sellerId: 'u1', buyerName: 'PT Green Cycle', sellerName: 'CV Tekstil Mandiri',
    quantity: 1000, pricePerKg: 3000, totalPrice: 3000000, downPayment: 900000,
    finalPrice: 3000000, paymentMethod: 'MIDTRANS', escrowStatus: 'RELEASED', pickupMethod: 'COURIER',
    status: 'COMPLETED', createdAt: '2024-11-05', estimatedPickup: '2024-11-15', pickupDate: '2024-11-15',
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1', senderId: 'ai', senderName: 'Asisten BursaLimbah', isAI: true, read: true,
    content: 'Halo! 👋 Saya asisten AI BursaLimbah. Saya bisa membantu Anda mencari limbah, menghitung estimasi harga, atau memandu proses transaksi.',
    timestamp: '2024-11-16T10:00:00',
  },
  {
    id: 'm2', senderId: 'user', senderName: 'Anda', isAI: false, read: true,
    content: 'Saya cari limbah plastik PP di Jawa Timur, budget sekitar Rp 4000-5000/kg',
    timestamp: '2024-11-16T10:01:00',
  },
  {
    id: 'm3', senderId: 'ai', senderName: 'Asisten BursaLimbah', isAI: true, read: true,
    content: 'Baik, saya menemukan 2 listing yang cocok:\n\n🔹 **Limbah Plastik PP Grade A** - Surabaya\n   • Harga: Rp 4.500/kg • Tersedia: 5.000 kg\n\n🔹 **Plastik HDPE Mix** - Malang\n   • Harga: Rp 3.800/kg • Tersedia: 2.000 kg\n\nMau saya bantu negosiasi atau booking?',
    timestamp: '2024-11-16T10:01:30',
    toolCalls: [{ name: 'searchListings', args: { category: 'PLASTIC', province: 'Jawa Timur', maxPrice: 5000 } }],
  },
];

/** Format number to Indonesian Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

/** Format number with Indonesian locale */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
