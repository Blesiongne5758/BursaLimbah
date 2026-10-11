import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'budi@plastikjaya.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should display dashboard overview', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Total Transaksi')).toBeVisible();
    await expect(page.locator('text=Pendapatan')).toBeVisible();
  });

  test('should switch to listings tab', async ({ page }) => {
    await page.click('text=Listing');
    
    await expect(page.locator('text=listing aktif')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should switch to bookings tab', async ({ page }) => {
    await page.click('text=Booking');
    
    await expect(page.locator('text=transaksi')).toBeVisible();
  });

  test('should switch to wallet tab', async ({ page }) => {
    await page.click('text=Wallet');
    
    await expect(page.locator('text=Saldo Tersedia')).toBeVisible();
    await expect(page.locator('text=Ditahan Escrow')).toBeVisible();
  });

  test('should switch to reports tab', async ({ page }) => {
    await page.click('text=Laporan');
    
    await expect(page.locator('text=Laporan')).toBeVisible();
  });

  test('should switch to settings tab', async ({ page }) => {
    await page.click('text=Pengaturan');
    
    await expect(page.locator('text=Profil')).toBeVisible();
    await expect(page.locator('text=Verifikasi KYC')).toBeVisible();
  });
});
