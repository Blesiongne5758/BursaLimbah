import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Jual Beli Limbah');
    await expect(page.locator('text=Aman & Transparan')).toBeVisible();
  });

  test('should navigate to marketplace', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Jelajahi Marketplace');
    await expect(page).toHaveURL(/.*marketplace/);
  });

  test('should navigate to pricing', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Harga');
    await expect(page).toHaveURL(/.*pricing/);
  });

  test('should display trust badges', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Escrow Payment')).toBeVisible();
    await expect(page.locator('text=AES-256 Encryption')).toBeVisible();
    await expect(page.locator('text=UU PDP Compliant')).toBeVisible();
  });

  test('should display categories', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Plastik')).toBeVisible();
    await expect(page.locator('text=Kertas')).toBeVisible();
    await expect(page.locator('text=Logam')).toBeVisible();
  });
});
