import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('h1')).toContainText('Item Analyzer');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should submit analysis form', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.fill('textarea[name="description"]', 'Test vintage watch');
    await page.fill('input[name="url"]', 'https://example.com/watch');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Mock the API response
    await page.route('/api/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'Analysis: This is a valuable vintage watch worth $500-800.'
      });
    });
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Analysis: This is a valuable')).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Total Analyses')).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    
    await expect(page.locator('h1')).toContainText('User Preferences');
    await expect(page.locator('button')).toContainText('Save Preferences');
  });

  test('should handle mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('h1')).toBeVisible();
    // Check responsive design
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should test PWA installation', async ({ page, browserName }) => {
    // Skip on Firefox as it doesn't support PWA testing well
    test.skip(browserName === 'firefox');
    
    await page.goto('http://localhost:3000');
    
    // Check for service worker
    const swController = await page.evaluate(() => navigator.serviceWorker.controller);
    expect(swController).not.toBeNull();
    
    // Check for manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });
});