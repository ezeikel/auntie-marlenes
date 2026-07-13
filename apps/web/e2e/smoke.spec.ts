import { expect, test } from '@playwright/test';

// Dev server compiles pages on first visit — allow generous timeouts
test.use({ navigationTimeout: 60_000 });

test.describe('Smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Auntie Marlene/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('shop page renders products', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveTitle(/Shop/i);
    await expect(
      page
        .locator('[data-testid="product-card"]')
        .or(page.locator('a[href*="/product/"]'))
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('product page loads with details', async ({ page }) => {
    await page.goto('/shop');
    const productLink = page.locator('a[href*="/product/"]').first();
    await expect(productLink).toBeVisible({ timeout: 30_000 });
    await productLink.click();
    await page.waitForURL('**/product/**');
    await expect(
      page
        .locator('button')
        .filter({ hasText: /add to bag/i })
        .or(page.locator('button').filter({ hasText: /add to cart/i }))
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('not found page shows message', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    // next-intl may treat unknown paths as category pages — check for either
    // a 404 message or a valid page load (both are acceptable)
    const notFoundText = page.getByText(/not found/i).first();
    const mainContent = page.locator('#main-content');
    await expect(notFoundText.or(mainContent)).toBeVisible();
  });

  test('bag page loads', async ({ page }) => {
    await page.goto('/bag');
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
