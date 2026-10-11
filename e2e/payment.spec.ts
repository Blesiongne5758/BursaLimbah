import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'siti@greencycle.id');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should navigate to payment from listing', async ({ page }) => {
    await page.goto('/marketplace');
    await page.locator('[data-testid="listing-card"]').first().click();
    await page.waitForURL(/.*listing-detail/);
    
    await page.click('text=Mulai Negosiasi');
    await expect(page).toHaveURL(/.*payment/);
  });

  test('should display order review', async ({ page }) => {
    await page.goto('/payment');
    
    await expect(page.locator('text=Review Pesanan')).toBeVisible();
    await expect(page.locator('text=Limbah Plastik PP Grade A')).toBeVisible();
    await expect(page.locator('text=Quantity')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('should proceed to payment', async ({ page }) => {
    await page.goto('/payment');
    
    await page.click('text=Lanjut ke Pembayaran');
    await expect(page.locator('text=Pembayaran DP')).toBeVisible();
    await expect(page.locator('text=Transaction ID')).toBeVisible();
  });

  test('should display payment methods', async ({ page }) => {
    await page.goto('/payment');
    await page.click('text=Lanjut ke Pembayaran');
    
    await expect(page.locator('text=BCA Virtual Account')).toBeVisible();
    await expect(page.locator('text=Mandiri Virtual Account')).toBeVisible();
    await expect(page.locator('text=GoPay')).toBeVisible();
  });

  test('should complete payment', async ({ page }) => {
    await page.goto('/payment');
    await page.click('text=Lanjut ke Pembayaran');
    await page.click('text=Bayar Sekarang');
    
    await expect(page.locator('text=Pembayaran Berhasil')).toBeVisible();
    await expect(page.locator('text=Order ID')).toBeVisible();
  });
});
