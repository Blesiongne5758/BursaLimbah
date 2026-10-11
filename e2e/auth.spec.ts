import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Masuk ke BursaLimbah');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'budi@plastikjaya.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Selamat datang kembali')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email atau password salah')).toBeVisible();
  });

  test('should switch to register form', async ({ page }) => {
    await page.click('text=Belum punya akun? Daftar gratis');
    
    await expect(page.locator('h1')).toContainText('Daftar Akun Baru');
    await expect(page.locator('input[placeholder*="Nama"]')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'budi@plastikjaya.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Logout
    await page.click('[title="Keluar"]');
    await expect(page).toHaveURL(/.*$/);
  });
});
