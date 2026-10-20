/**
 * BursaLimbah.com - Global State Store (Zustand)
 * Manages authentication, navigation, and application state
 */

import { create } from 'zustand';
import { User, MembershipTier, ChatMessage } from './types';
import { MOCK_CHAT_MESSAGES } from './data';

type Page = 'landing' | 'marketplace' | 'listing-detail' | 'dashboard' | 'auth' | 'admin' | 'admin-config' | 'test-connection' | 'wallet' | 'pricing' | 'kyc' | 'payment' | 'payment-result' | 'schema' | 'terms' | 'privacy';

interface AppState {
  // Navigation
  currentPage: Page;
  selectedListingId: string | null;
  setPage: (page: Page) => void;
  setSelectedListing: (id: string | null) => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  setUser: (user: User) => void;
  logout: () => void;
  register: (data: Partial<User>) => void;

  // Chat
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  toggleChat: () => void;
  addMessage: (message: ChatMessage) => void;

  // UI
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'landing',
  selectedListingId: null,
  setPage: (page) => set({ currentPage: page }),
  setSelectedListing: (id) => set({ selectedListingId: id }),

  // Auth
  isAuthenticated: false,
  currentUser: null,
  login: (email: string, _password: string) => {
    // Simulated login
    const mockUsers: Record<string, User> = {
      'budi@plastikjaya.com': {
        id: 'u1', name: 'Budi Santoso', email: 'budi@plastikjaya.com',
        phone: '+62 812-3456-7890', role: 'SELLER', membershipTier: 'SMALL_BUSINESS',
        kycStatus: 'VERIFIED', city: 'Surabaya', province: 'Jawa Timur',
        isVerified: true, createdAt: '2024-01-15',
      },
      'siti@greencycle.id': {
        id: 'u2', name: 'Siti Rahayu', email: 'siti@greencycle.id',
        phone: '+62 813-9876-5432', role: 'BUYER', membershipTier: 'CORPORATE',
        kycStatus: 'VERIFIED', city: 'Jakarta', province: 'DKI Jakarta',
        isVerified: true, createdAt: '2024-02-20',
      },
      'admin@bursalimbah.com': {
        id: 'admin', name: 'Admin BursaLimbah', email: 'admin@bursalimbah.com',
        phone: '+62 21-5555-0000', role: 'ADMIN', membershipTier: 'CORPORATE',
        kycStatus: 'VERIFIED', city: 'Jakarta', province: 'DKI Jakarta',
        isVerified: true, createdAt: '2024-01-01',
      },
    };

    const user = mockUsers[email];
    if (user) {
      set({ isAuthenticated: true, currentUser: user });
      return true;
    }
    return false;
  },
  setUser: (user: User) => set({ isAuthenticated: true, currentUser: user }),
  logout: () => set({ isAuthenticated: false, currentUser: null, currentPage: 'landing' }),
  register: (data) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: 'USER',
      membershipTier: 'PERSONAL',
      kycStatus: 'PENDING',
      city: data.city || '',
      province: data.province || '',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    set({ isAuthenticated: true, currentUser: newUser });
  },

  // Chat
  chatMessages: MOCK_CHAT_MESSAGES,
  chatOpen: false,
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  addMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  // UI
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

/**
 * Hook to check feature gate access
 */
export function useFeatureGate() {
  const user = useStore((state) => state.currentUser);
  const tier = user?.membershipTier || 'PERSONAL';

  const gates: Record<MembershipTier, {
    maxListings: number;
    maxNegotiations: number;
    aiChat: 'basic' | 'full' | 'full_custom';
    viewHistory: boolean;
    bulkUpload: boolean;
    exportReports: boolean;
    priorityListing: boolean;
    apiAccess: boolean;
  }> = {
    PERSONAL: {
      maxListings: 5,
      maxNegotiations: 20,
      aiChat: 'basic',
      viewHistory: false,
      bulkUpload: false,
      exportReports: false,
      priorityListing: false,
      apiAccess: false,
    },
    SMALL_BUSINESS: {
      maxListings: 25,
      maxNegotiations: 100,
      aiChat: 'full',
      viewHistory: true,
      bulkUpload: true,
      exportReports: true,
      priorityListing: false,
      apiAccess: false,
    },
    CORPORATE: {
      maxListings: Infinity,
      maxNegotiations: Infinity,
      aiChat: 'full_custom',
      viewHistory: true,
      bulkUpload: true,
      exportReports: true,
      priorityListing: true,
      apiAccess: true,
    },
  };

  return {
    tier,
    ...gates[tier],
    canAccess: (feature: keyof typeof gates.PERSONAL) => {
      const value = gates[tier][feature];
      return value !== false && value !== 'basic';
    },
  };
}
