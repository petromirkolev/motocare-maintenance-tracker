import { test, expect } from '@playwright/test';

test.describe('Moto Care smoke test suite', () => {
  test('Moto Care app loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Moto/i);
  });
});
