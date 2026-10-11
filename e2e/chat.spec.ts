import { test, expect } from '@playwright/test';

test.describe('AI Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display chat button', async ({ page }) => {
    await expect(page.locator('button:has(svg)')).toBeVisible();
  });

  test('should open chat widget', async ({ page }) => {
    await page.click('button:has(svg)');
    
    await expect(page.locator('text=Asisten AI')).toBeVisible();
    await expect(page.locator('text=GPT-4o • Online')).toBeVisible();
  });

  test('should send message', async ({ page }) => {
    await page.click('button:has(svg)');
    
    await page.fill('input[placeholder*="Tanya"]', 'Halo, saya cari limbah plastik');
    await page.click('button:has(svg.lucide-send)');
    
    await expect(page.locator('text=Halo, saya cari limbah plastik')).toBeVisible();
  });

  test('should receive AI response', async ({ page }) => {
    await page.click('button:has(svg)');
    
    await page.fill('input[placeholder*="Tanya"]', 'Berapa harga limbah plastik?');
    await page.click('button:has(svg.lucide-send)');
    
    // Wait for AI response
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Asisten BursaLimbah').last()).toBeVisible();
  });

  test('should close chat widget', async ({ page }) => {
    await page.click('button:has(svg)');
    await expect(page.locator('text=Asisten AI')).toBeVisible();
    
    await page.click('button:has(svg.lucide-x)');
    await expect(page.locator('text=Asisten AI')).not.toBeVisible();
  });

  test('should show typing indicator', async ({ page }) => {
    await page.click('button:has(svg)');
    
    await page.fill('input[placeholder*="Tanya"]', 'Cari limbah plastik di Jawa Timur');
    await page.click('button:has(svg.lucide-send)');
    
    // Typing indicator should appear
    await expect(page.locator('.animate-bounce')).toBeVisible();
  });
});
