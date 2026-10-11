/**
 * BursaLimbah.com - TypeScript Type Definitions
 * Aligned with Prisma Schema (PostgreSQL)
 * 
 * Schema relationships:
 * - User 1:N Listing (seller)
 * - User 1:N Booking (buyer)
 * - Listing 1:N Booking
 * - User 1:1 CompanyInfo
 * - Booking 1:1 Validation
 * - User N:M Conversation (via ConversationParticipant)
 */

// ============================================
// ENUMS (from Prisma schema)
// ============================================
export type Role = 'USER' | 'SELLER' | 'BUYER' | 'ADMIN';
export type Tier = 'PERSONAL' | 'SMALL_BUSINESS' | 'CORPORATE';
export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type WasteCategory = 'PLASTIC' | 'PAPER' | 'METAL' | 'ELECTRONIC' | 'ORGANIC' | 'B3' | 'INDUSTRIAL' | 'TEXTILE' | 'CONSTRUCTION';
export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'NEGOTIATING' | 'SOLD' | 'ARCHIVED';
export type EscrowStatus = 'PENDING' | 'HOLD' | 'RELEASED' | 'REFUNDED';
export type PaymentMethod = 'MIDTRANS' | 'XENDIT' | 'BANK_TRANSFER';
export type PickupMethod = 'SELF' | 'COURIER';

// Backward-compatible aliases
export type MembershipTier = Tier;
export type UserRole = Role;
export type TransactionStatus = ListingStatus | 'BOOKED' | 'PAID_DP' | 'READY_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'VALIDATED' | 'COMPLETED' | 'REVIEWED';
export type PriceTier = 'BRONZE' | 'SILVER' | 'GOLD';

// ============================================
// MODELS (from Prisma schema)
// ============================================

/** User model - core entity */
export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string; // Never expose to client
  name: string;
  role: Role;
  membershipTier: Tier;
  kycStatus: KYCStatus;
  companyInfo?: CompanyInfo;
  city: string;
  province: string;
  createdAt: string;
  // Backward compatibility
  isVerified: boolean;
}

/** CompanyInfo - for KYB verification */
export interface CompanyInfo {
  userId: string;
  companyName: string;
  npwp?: string;
  nib?: string;
  businessLicense?: string;
  industrySector?: string;
}

/** Listing model - waste listing with privacy masking */
export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerTier: Tier;
  category: WasteCategory;
  subCategory: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  basePrice: number;
  negotiable: boolean;
  // Privacy: GPS encrypted, only city/province exposed
  city: string;
  province: string;
  encryptedCoords: string; // AES-256-GCM encrypted lat/lng
  locationHash: string; // For verification without reveal
  status: ListingStatus;
  aiGenerated: boolean;
  priceTier: PriceTier;
  createdAt: string;
  // Backward compatibility aliases
  pricePerKg: number;
  isB3: boolean;
  images: string[];
}

/** Booking model - transaction entity */
export interface Booking {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
  pickupDate: string;
  downPayment: number;
  finalPrice?: number;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  escrowStatus: EscrowStatus;
  pickupMethod: PickupMethod;
  courierId?: string;
  validation?: Validation;
  status: TransactionStatus;
  createdAt: string;
  estimatedPickup: string;
}

/** Validation model - post-pickup verification */
export interface Validation {
  bookingId: string;
  actualQuantity: number;
  actualPhotos: string[];
  finalPrice: number;
  conditionNotes?: string;
  validatedById: string;
  validatedAt: string;
}

/** Conversation model - chat between users */
export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  aiAgent: boolean;
  context?: Record<string, unknown>;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ConversationParticipant {
  userId: string;
  conversationId: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderName: string;
  isAI: boolean;
  content: string;
  toolCalls?: ToolCall[];
  read?: boolean;
  timestamp: string;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

// ============================================
// FEATURE GATES
// ============================================
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

export const FEATURE_GATES: Record<Tier, FeatureGate> = {
  PERSONAL: {
    maxListings: 5, maxNegotiations: 20, aiChat: 'basic',
    viewHistory: false, bulkUpload: false, exportReports: false,
    priorityListing: false, dedicatedManager: false, apiAccess: false, customSLA: false,
    visibleTiers: ['BRONZE'],
  },
  SMALL_BUSINESS: {
    maxListings: 25, maxNegotiations: 100, aiChat: 'full',
    viewHistory: true, bulkUpload: true, exportReports: true,
    priorityListing: false, dedicatedManager: false, apiAccess: false, customSLA: false,
    visibleTiers: ['BRONZE', 'SILVER'],
  },
  CORPORATE: {
    maxListings: Infinity, maxNegotiations: Infinity, aiChat: 'full_custom',
    viewHistory: true, bulkUpload: true, exportReports: true,
    priorityListing: true, dedicatedManager: true, apiAccess: true, customSLA: true,
    visibleTiers: ['BRONZE', 'SILVER', 'GOLD'],
  },
};

// ============================================
// CONSTANTS
// ============================================
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

export const LISTING_STATUS_COLORS: Record<ListingStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' },
  PUBLISHED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dipublikasi' },
  NEGOTIATING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Negosiasi' },
  SOLD: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Terjual' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Diarsipkan' },
};

export const TRANSACTION_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
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
  SOLD: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Terjual' },
};

export const ESCROW_STATUS_COLORS: Record<EscrowStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Menunggu' },
  HOLD: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Ditahan' },
  RELEASED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Dilepas' },
  REFUNDED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dikembalikan' },
};

// ============================================
// PRISMA SCHEMA VISUALIZATION DATA
// ============================================
export interface SchemaModel {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    isRelation?: boolean;
    isPK?: boolean;
    isFK?: boolean;
    isOptional?: boolean;
    description?: string;
  }>;
  description: string;
  color: string;
}

export const PRISMA_SCHEMA: SchemaModel[] = [
  {
    name: 'User',
    description: 'Core user entity with role-based access',
    color: 'emerald',
    fields: [
      { name: 'id', type: 'String', isPK: true, description: 'CUID primary key' },
      { name: 'email', type: 'String', description: 'Unique email address' },
      { name: 'phone', type: 'String?', isOptional: true },
      { name: 'passwordHash', type: 'String', description: 'Argon2id hashed' },
      { name: 'role', type: 'Role', description: 'USER | SELLER | BUYER | ADMIN' },
      { name: 'membershipTier', type: 'Tier', description: 'PERSONAL | SMALL_BUSINESS | CORPORATE' },
      { name: 'kycStatus', type: 'KYCStatus', description: 'PENDING | VERIFIED | REJECTED' },
      { name: 'companyInfo', type: 'CompanyInfo?', isRelation: true, isOptional: true },
      { name: 'listings', type: 'Listing[]', isRelation: true },
      { name: 'purchases', type: 'Purchase[]', isRelation: true },
      { name: 'conversations', type: 'ConversationParticipant[]', isRelation: true },
      { name: 'createdAt', type: 'DateTime', description: '@default(now())' },
    ],
  },
  {
    name: 'CompanyInfo',
    description: 'KYB verification data for business users',
    color: 'blue',
    fields: [
      { name: 'userId', type: 'String', isPK: true, isFK: true },
      { name: 'user', type: 'User', isRelation: true },
      { name: 'companyName', type: 'String' },
      { name: 'npwp', type: 'String?', isOptional: true, description: 'Tax ID' },
      { name: 'nib', type: 'String?', isOptional: true, description: 'Business ID' },
      { name: 'businessLicense', type: 'String?', isOptional: true, description: 'Izin lingkungan, B3' },
      { name: 'industrySector', type: 'String?', isOptional: true },
    ],
  },
  {
    name: 'Listing',
    description: 'Waste listing with privacy masking (GPS encrypted)',
    color: 'amber',
    fields: [
      { name: 'id', type: 'String', isPK: true },
      { name: 'sellerId', type: 'String', isFK: true },
      { name: 'seller', type: 'User', isRelation: true },
      { name: 'category', type: 'WasteCategory', description: 'PLASTIC | PAPER | METAL | ...' },
      { name: 'subCategory', type: 'String' },
      { name: 'title', type: 'String' },
      { name: 'description', type: 'String' },
      { name: 'quantity', type: 'Float' },
      { name: 'unit', type: 'String', description: 'kg, ton, liter' },
      { name: 'basePrice', type: 'Decimal' },
      { name: 'negotiable', type: 'Boolean', description: '@default(true)' },
      { name: 'city', type: 'String', description: 'Public: city only' },
      { name: 'province', type: 'String' },
      { name: 'encryptedCoords', type: 'String', description: '🔒 AES-256 encrypted lat/lng' },
      { name: 'locationHash', type: 'String', description: 'Verification without reveal' },
      { name: 'status', type: 'ListingStatus' },
      { name: 'aiGenerated', type: 'Boolean', description: '@default(false)' },
      { name: 'createdAt', type: 'DateTime' },
    ],
  },
  {
    name: 'Booking',
    description: 'Transaction entity with escrow payment',
    color: 'purple',
    fields: [
      { name: 'id', type: 'String', isPK: true },
      { name: 'listingId', type: 'String', isFK: true },
      { name: 'listing', type: 'Listing', isRelation: true },
      { name: 'buyerId', type: 'String', isFK: true },
      { name: 'buyer', type: 'User', isRelation: true },
      { name: 'pickupDate', type: 'DateTime' },
      { name: 'downPayment', type: 'Decimal', description: '30% default' },
      { name: 'finalPrice', type: 'Decimal?', isOptional: true },
      { name: 'paymentMethod', type: 'PaymentMethod', description: 'MIDTRANS | XENDIT | BANK_TRANSFER' },
      { name: 'escrowStatus', type: 'EscrowStatus', description: 'PENDING | HOLD | RELEASED | REFUNDED' },
      { name: 'pickupMethod', type: 'PickupMethod', description: 'SELF | COURIER' },
      { name: 'courierId', type: 'String?', isOptional: true, description: 'API expedition' },
      { name: 'validation', type: 'Validation?', isRelation: true, isOptional: true },
      { name: 'createdAt', type: 'DateTime' },
    ],
  },
  {
    name: 'Validation',
    description: 'Post-pickup verification by buyer',
    color: 'teal',
    fields: [
      { name: 'bookingId', type: 'String', isPK: true, isFK: true },
      { name: 'booking', type: 'Booking', isRelation: true },
      { name: 'actualQuantity', type: 'Float' },
      { name: 'actualPhotos', type: 'String[]', description: 'Cloudinary URLs' },
      { name: 'finalPrice', type: 'Decimal' },
      { name: 'conditionNotes', type: 'String?', isOptional: true },
      { name: 'validatedById', type: 'String', isFK: true },
      { name: 'validatedBy', type: 'User', isRelation: true },
      { name: 'validatedAt', type: 'DateTime' },
    ],
  },
  {
    name: 'Conversation',
    description: 'Chat between users with optional AI agent',
    color: 'pink',
    fields: [
      { name: 'id', type: 'String', isPK: true },
      { name: 'participants', type: 'ConversationParticipant[]', isRelation: true },
      { name: 'aiAgent', type: 'Boolean', description: '@default(false)' },
      { name: 'context', type: 'Json', description: 'listingId, bookingId, etc' },
      { name: 'messages', type: 'Message[]', isRelation: true },
      { name: 'createdAt', type: 'DateTime' },
    ],
  },
];
