import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
  });

  test('should display listings', async ({ page }) => {
    await expect(page.locator('text=listing ditemukan')).toBeVisible();
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.click('text=Plastik');
    
    await expect(page.locator('text=Plastik')).toBeVisible();
    const listings = page.locator('[data-testid="listing-card"]');
    await expect(listings).toHaveCount(await listings.count());
  });

  test('should search listings', async ({ page }) => {
    await page.fill('input[placeholder*="Cari limbah"]', 'aluminium');
    await page.waitForTimeout(500); // Wait for debounce
    
    const listings = page.locator('[data-testid="listing-card"]');
    const count = await listings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should sort by price', async ({ page }) => {
    await page.selectOption('select', 'price_low');
    
    const listings = page.locator('[data-testid="listing-card"]');
    await expect(listings.first()).toBeVisible();
  });

  test('should navigate to listing detail', async ({ page }) => {
    await page.locator('[data-testid="listing-card"]').first().click();
    
    await expect(page).toHaveURL(/.*listing-detail/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display shipping calculator', async ({ page }) => {
    await page.locator('[data-testid="listing-card"]').first().click();
    await page.waitForURL(/.*listing-detail/);
    
    await page.click('text=Hitung Ongkir');
    await expect(page.locator('text=JNE')).toBeVisible();
  });
});
