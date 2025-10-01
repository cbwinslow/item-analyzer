
import { test, expect } from '@playwright/test';

test.describe('ItemAnalyzer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user workflow', async ({ page }) => {
    // Navigate to the application
    await expect(page).toHaveTitle(/Item Analyzer/);

    // Fill out the form
    await page.fill('textarea[name="description"]', 'Test item description');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('.results');
    await expect(page.locator('.results')).toBeVisible();
  });

  test('handles form validation', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('.error')).toBeVisible();
  });

  test('responsive design', async ({ page, browserName }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('form')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('form')).toBeVisible();
  });

  test('accessibility', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label]')).toBeTruthy();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});
