/**
 * Integration tests for critical user flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useStore } from '../store';

describe('Integration Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      isAuthenticated: false,
      currentUser: null,
      currentPage: 'landing',
    });
  });

  describe('User Authentication Flow', () => {
    it('should navigate to auth page from landing', async () => {
      render(<App />);
      
      // Click "Masuk" button
      const loginButton = screen.getByText('Masuk');
      fireEvent.click(loginButton);
      
      // Should navigate to auth page
      await waitFor(() => {
        expect(screen.getByText('Masuk ke BursaLimbah')).toBeInTheDocument();
      });
    });

    it('should login with valid credentials', async () => {
      render(<App />);
      
      // Navigate to auth page
      fireEvent.click(screen.getByText('Masuk'));
      
      // Fill login form
      const emailInput = screen.getByPlaceholderText('email@perusahaan.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      await userEvent.type(emailInput, 'budi@plastikjaya.com');
      await userEvent.type(passwordInput, 'password123');
      
      // Submit form
      const submitButton = screen.getByText('Masuk');
      fireEvent.click(submitButton);
      
      // Should navigate to dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error for invalid credentials', async () => {
      render(<App />);
      
      // Navigate to auth page
      fireEvent.click(screen.getByText('Masuk'));
      
      // Fill invalid credentials
      const emailInput = screen.getByPlaceholderText('email@perusahaan.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      await userEvent.type(emailInput, 'invalid@email.com');
      await userEvent.type(passwordInput, 'wrongpass');
      
      // Submit form
      const submitButton = screen.getByText('Masuk');
      fireEvent.click(submitButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Email atau password salah/)).toBeInTheDocument();
      });
    });

    it('should logout user', async () => {
      // Login first
      useStore.setState({
        isAuthenticated: true,
        currentUser: {
          id: 'u1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          membershipTier: 'PERSONAL',
          kycStatus: 'VERIFIED',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          isVerified: true,
          createdAt: '2024-01-01',
        },
        currentPage: 'dashboard',
      });
      
      render(<App />);
      
      // Click logout button
      const logoutButton = screen.getByTitle('Keluar');
      fireEvent.click(logoutButton);
      
      // Should navigate to landing page
      await waitFor(() => {
        expect(screen.getByText('Jual Beli Limbah')).toBeInTheDocument();
      });
    });
  });

  describe('Marketplace Browsing Flow', () => {
    it('should navigate to marketplace from landing', async () => {
      render(<App />);
      
      // Click "Jelajahi Marketplace" button
      const browseButton = screen.getByText('Jelajahi Marketplace');
      fireEvent.click(browseButton);
      
      // Should navigate to marketplace page
      await waitFor(() => {
        expect(screen.getByText('listing ditemukan')).toBeInTheDocument();
      });
    });

    it('should filter listings by category', async () => {
      render(<App />);
      
      // Navigate to marketplace
      fireEvent.click(screen.getByText('Jelajahi Marketplace'));
      
      // Wait for marketplace to load
      await waitFor(() => {
        expect(screen.getByText('listing ditemukan')).toBeInTheDocument();
      });
      
      // Click on Plastic category
      const plasticCategory = screen.getByText(/Plastik/);
      fireEvent.click(plasticCategory);
      
      // Should filter listings
      await waitFor(() => {
        const listings = screen.getAllByText(/Limbah Plastik/);
        expect(listings.length).toBeGreaterThan(0);
      });
    });

    it('should search listings', async () => {
      render(<App />);
      
      // Navigate to marketplace
      fireEvent.click(screen.getByText('Jelajahi Marketplace'));
      
      // Wait for marketplace to load
      await waitFor(() => {
        expect(screen.getByText('listing ditemukan')).toBeInTheDocument();
      });
      
      // Search for "aluminium"
      const searchInput = screen.getByPlaceholderText(/Cari limbah/);
      await userEvent.type(searchInput, 'aluminium');
      
      // Should filter listings
      await waitFor(() => {
        const listings = screen.getAllByText(/Aluminium/i);
        expect(listings.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('should navigate to listing detail', async () => {
      render(<App />);
      
      // Navigate to marketplace
      fireEvent.click(screen.getByText('Jelajahi Marketplace'));
      
      // Wait for marketplace to load
      await waitFor(() => {
        expect(screen.getByText('listing ditemukan')).toBeInTheDocument();
      });
      
      // Click on first listing
      const firstListing = screen.getAllByText(/Limbah/)[0];
      fireEvent.click(firstListing);
      
      // Should navigate to listing detail
      await waitFor(() => {
        expect(screen.getByText('Deskripsi')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Flow', () => {
    beforeEach(() => {
      // Login user
      useStore.setState({
        isAuthenticated: true,
        currentUser: {
          id: 'u1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          membershipTier: 'PERSONAL',
          kycStatus: 'VERIFIED',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          isVerified: true,
          createdAt: '2024-01-01',
        },
      });
    });

    it('should navigate to dashboard', async () => {
      render(<App />);
      
      // Navigate to dashboard
      useStore.setState({ currentPage: 'dashboard' });
      
      // Should show dashboard
      await waitFor(() => {
        expect(screen.getByText('Selamat datang kembali')).toBeInTheDocument();
      });
    });

    it('should switch between dashboard tabs', async () => {
      render(<App />);
      useStore.setState({ currentPage: 'dashboard' });
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Selamat datang kembali')).toBeInTheDocument();
      });
      
      // Click on Listings tab
      const listingsTab = screen.getByText('Listing');
      fireEvent.click(listingsTab);
      
      // Should show listings tab content
      await waitFor(() => {
        expect(screen.getByText('listing aktif')).toBeInTheDocument();
      });
      
      // Click on Wallet tab
      const walletTab = screen.getByText('Wallet');
      fireEvent.click(walletTab);
      
      // Should show wallet tab content
      await waitFor(() => {
        expect(screen.getByText('Saldo Tersedia')).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Flow', () => {
    it('should navigate to pricing page', async () => {
      render(<App />);
      
      // Click on "Harga" link
      const pricingLink = screen.getByText('Harga');
      fireEvent.click(pricingLink);
      
      // Should navigate to pricing page
      await waitFor(() => {
        expect(screen.getByText('Paket Membership')).toBeInTheDocument();
      });
    });

    it('should show pricing plans', async () => {
      render(<App />);
      
      // Navigate to pricing
      fireEvent.click(screen.getByText('Harga'));
      
      // Should show all pricing plans
      await waitFor(() => {
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('Small Business')).toBeInTheDocument();
        expect(screen.getByText('Corporate')).toBeInTheDocument();
      });
    });

    it('should navigate to auth from pricing', async () => {
      render(<App />);
      
      // Navigate to pricing
      fireEvent.click(screen.getByText('Harga'));
      
      // Click on "Mulai Gratis" button
      const ctaButton = screen.getByText('Mulai Gratis');
      fireEvent.click(ctaButton);
      
      // Should navigate to auth page
      await waitFor(() => {
        expect(screen.getByText('Masuk ke BursaLimbah')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between pages', async () => {
      render(<App />);
      
      // Start at landing
      expect(screen.getByText('Jual Beli Limbah')).toBeInTheDocument();
      
      // Go to marketplace
      fireEvent.click(screen.getByText('Jelajahi Marketplace'));
      await waitFor(() => {
        expect(screen.getByText('listing ditemukan')).toBeInTheDocument();
      });
      
      // Go to pricing
      fireEvent.click(screen.getByText('Harga'));
      await waitFor(() => {
        expect(screen.getByText('Paket Membership')).toBeInTheDocument();
      });
      
      // Go to auth
      fireEvent.click(screen.getByText('Masuk'));
      await waitFor(() => {
        expect(screen.getByText('Masuk ke BursaLimbah')).toBeInTheDocument();
      });
      
      // Go back to landing
      fireEvent.click(screen.getByText('BursaLimbah').closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Jual Beli Limbah')).toBeInTheDocument();
      });
    });
  });

  describe('AI Chat Widget', () => {
    it('should open chat widget', async () => {
      render(<App />);
      
      // Click chat button
      const chatButton = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatButton);
      
      // Should show chat widget
      await waitFor(() => {
        expect(screen.getByText('Asisten AI')).toBeInTheDocument();
      });
    });

    it('should send message in chat', async () => {
      render(<App />);
      
      // Open chat
      const chatButton = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatButton);
      
      // Wait for chat to open
      await waitFor(() => {
        expect(screen.getByText('Asisten AI')).toBeInTheDocument();
      });
      
      // Type message
      const input = screen.getByPlaceholderText(/Tanya apa saja/);
      await userEvent.type(input, 'Halo');
      
      // Send message
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);
      
      // Should show user message
      await waitFor(() => {
        expect(screen.getByText('Halo')).toBeInTheDocument();
      });
    });

    it('should close chat widget', async () => {
      render(<App />);
      
      // Open chat
      const chatButton = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatButton);
      
      // Wait for chat to open
      await waitFor(() => {
        expect(screen.getByText('Asisten AI')).toBeInTheDocument();
      });
      
      // Close chat
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      // Should close chat widget
      await waitFor(() => {
        expect(screen.queryByText('Asisten AI')).not.toBeInTheDocument();
      });
    });
  });
});
