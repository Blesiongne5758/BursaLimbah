/**
 * BursaLimbah.com - TypeScript Type Definitions
 * Core types for the waste trading marketplace
 */

export type MembershipTier = 'PERSONAL' | 'SMALL_BUSINESS' | 'CORPORATE';
export type UserRole = 'USER' | 'SELLER' | 'BUYER' | 'ADMIN';
export type WasteCategory = 'PLASTIC' | 'PAPER' | 'METAL' | 'ELECTRONIC' | 'ORGANIC' | 'B3' | 'INDUSTRIAL' | 'TEXTILE' | 'CONSTRUCTION';
export type TransactionStatus = 'DRAFT' | 'PUBLISHED' | 'NEGOTIATING' | 'BOOKED' | 'PAID_DP' | 'READY_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'VALIDATED' | 'COMPLETED' | 'REVIEWED';
export type PriceTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  membershipTier: MembershipTier;
  avatar?: string;
  city: string;
  province: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: WasteCategory;
  pricePerKg: number;
  quantity: number;
  unit: string;
  city: string;
  province: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerTier: MembershipTier;
  status: TransactionStatus;
  isB3: boolean;
  priceTier: PriceTier;
  createdAt: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  dpAmount: number;
  status: TransactionStatus;
  createdAt: string;
  estimatedPickup: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface FeatureGate {
  maxListings: number;
  maxNegotiations: number;
  aiChat: 'basic' | 'full' | 'full_custom';
  viewHistory: boolean;
  bulkUpload: boolean;
  exportReports: boolean;
  priorityListing: boolean;
  dedicatedManager: boolean;
  apiAccess: boolean;
  customSLA: boolean;
  visibleTiers: PriceTier[];
}

export const FEATURE_GATES: Record<MembershipTier, FeatureGate> = {
  PERSONAL: {
    maxListings: 5,
    maxNegotiations: 20,
    aiChat: 'basic',
    viewHistory: false,
    bulkUpload: false,
    exportReports: false,
    priorityListing: false,
    dedicatedManager: false,
    apiAccess: false,
    customSLA: false,
    visibleTiers: ['BRONZE'],
  },
  SMALL_BUSINESS: {
    maxListings: 25,
    maxNegotiations: 100,
    aiChat: 'full',
    viewHistory: true,
    bulkUpload: true,
    exportReports: true,
    priorityListing: false,
    dedicatedManager: false,
    apiAccess: false,
    customSLA: false,
    visibleTiers: ['BRONZE', 'SILVER'],
  },
  CORPORATE: {
    maxListings: Infinity,
    maxNegotiations: Infinity,
    aiChat: 'full_custom',
    viewHistory: true,
    bulkUpload: true,
    exportReports: true,
    priorityListing: true,
    dedicatedManager: true,
    apiAccess: true,
    customSLA: true,
    visibleTiers: ['BRONZE', 'SILVER', 'GOLD'],
  },
};

export const WASTE_CATEGORIES: Record<WasteCategory, { label: string; icon: string; color: string }> = {
  PLASTIC: { label: 'Plastik', icon: '🧴', color: 'bg-blue-100 text-blue-700' },
  PAPER: { label: 'Kertas', icon: '📄', color: 'bg-yellow-100 text-yellow-700' },
  METAL: { label: 'Logam', icon: '⚙️', color: 'bg-gray-100 text-gray-700' },
  ELECTRONIC: { label: 'Elektronik', icon: '📱', color: 'bg-purple-100 text-purple-700' },
  ORGANIC: { label: 'Organik', icon: '🌿', color: 'bg-green-100 text-green-700' },
  B3: { label: 'B3 (Berbahaya)', icon: '☢️', color: 'bg-red-100 text-red-700' },
  INDUSTRIAL: { label: 'Industri', icon: '🏭', color: 'bg-slate-100 text-slate-700' },
  TEXTILE: { label: 'Tekstil', icon: '🧵', color: 'bg-pink-100 text-pink-700' },
  CONSTRUCTION: { label: 'Konstruksi', icon: '🧱', color: 'bg-orange-100 text-orange-700' },
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' },
  PUBLISHED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dipublikasi' },
  NEGOTIATING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Negosiasi' },
  BOOKED: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Dibooking' },
  PAID_DP: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'DP Dibayar' },
  READY_PICKUP: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Siap Ambil' },
  IN_TRANSIT: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Dalam Perjalanan' },
  DELIVERED: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Terkirim' },
  VALIDATED: { bg: 'bg-lime-100', text: 'text-lime-700', label: 'Divalidasi' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
  REVIEWED: { bg: 'bg-emerald-200', text: 'text-emerald-800', label: 'Direview' },
};
