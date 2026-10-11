/**
 * API Client for BursaLimbah Backend
 * Ready to connect to Next.js API routes
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      city: string;
      province: string;
      membershipTier: string;
    }) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
    me: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  },

  // Listings
  listings: {
    getAll: async (params?: {
      category?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
    }) => {
      const response = await apiClient.get('/listings', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/listings/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/listings', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/listings/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/listings/${id}`);
      return response.data;
    },
  },

  // Bookings
  bookings: {
    getAll: async () => {
      const response = await apiClient.get('/bookings');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/bookings', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.put(`/bookings/${id}`, data);
      return response.data;
    },
  },

  // Payment
  payment: {
    create: async (data: {
      listingId: string;
      quantity: number;
    }) => {
      const response = await apiClient.post('/payment/create', data);
      return response.data;
    },
    verify: async (transactionId: string) => {
      const response = await apiClient.post('/payment/verify', { transactionId });
      return response.data;
    },
    status: async (bookingId: string) => {
      const response = await apiClient.get(`/payment/status/${bookingId}`);
      return response.data;
    },
  },

  // Shipping
  shipping: {
    calculate: async (params: {
      origin: string;
      destination: string;
      weight: number;
    }) => {
      const response = await apiClient.get('/shipping/calculate', { params });
      return response.data;
    },
    track: async (waybill: string) => {
      const response = await apiClient.get(`/shipping/track/${waybill}`);
      return response.data;
    },
  },

  // KYC
  kyc: {
    submitKTP: async (data: any) => {
      const response = await apiClient.post('/kyc/ktp', data);
      return response.data;
    },
    submitNPWP: async (data: any) => {
      const response = await apiClient.post('/kyc/npwp', data);
      return response.data;
    },
    submitNIB: async (data: any) => {
      const response = await apiClient.post('/kyc/nib', data);
      return response.data;
    },
    status: async () => {
      const response = await apiClient.get('/kyc/status');
      return response.data;
    },
  },

  // AI Chat
  chat: {
    send: async (messages: any[], context?: any) => {
      const response = await apiClient.post('/chat/agent', { messages, context });
      return response.data;
    },
    history: async () => {
      const response = await apiClient.get('/chat/history');
      return response.data;
    },
  },

  // Admin
  admin: {
    getUsers: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    },
    getListings: async () => {
      const response = await apiClient.get('/admin/listings');
      return response.data;
    },
    moderateListing: async (id: string, action: 'approve' | 'reject') => {
      const response = await apiClient.post(`/admin/listings/${id}/moderate`, { action });
      return response.data;
    },
    getStats: async () => {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    },
  },
};

export default api;
