/**
 * Authentication Hooks
 * Production-ready hooks for authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

/**
 * Hook for user authentication
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await api.auth.me();
        setUser(userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.auth.login(email, password);
      
      // Store token
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);

      return { success: true, user: response.user };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login gagal';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    province: string;
    membershipTier: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.auth.register(data);
      
      // Auto login after register
      const loginResponse = await api.auth.login(data.email, data.password);
      localStorage.setItem('auth_token', loginResponse.token);
      setUser(loginResponse.user);

      return { success: true, user: loginResponse.user };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registrasi gagal';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}

/**
 * Hook for protected routes
 */
export function useProtectedRoute(redirectTo = '/auth') {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, redirectTo]);

  return { user, loading, isAuthenticated };
}

/**
 * Hook for role-based access
 */
export function useRequireRole(allowedRoles: string[]) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || !allowedRoles.includes(user.role))) {
      window.location.href = '/';
    }
  }, [loading, isAuthenticated, user, allowedRoles]);

  return { user, loading, hasAccess: !!user && allowedRoles.includes(user.role) };
}

/**
 * Hook for membership tier access
 */
export function useRequireTier(minimumTier: 'PERSONAL' | 'SMALL_BUSINESS' | 'CORPORATE') {
  const { user, loading, isAuthenticated } = useAuth();

  const tierLevels = {
    PERSONAL: 0,
    SMALL_BUSINESS: 1,
    CORPORATE: 2,
  };

  const hasAccess = !!user && tierLevels[user.membershipTier] >= tierLevels[minimumTier];

  useEffect(() => {
    if (!loading && (!isAuthenticated || !hasAccess)) {
      window.location.href = '/pricing';
    }
  }, [loading, isAuthenticated, hasAccess]);

  return { user, loading, hasAccess };
}
