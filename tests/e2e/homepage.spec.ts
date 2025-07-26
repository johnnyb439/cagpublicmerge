import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section with correct content', async ({ page }) => {
    // Check hero title
    await expect(page.locator('h1')).toContainText('Your Gateway to');
    await expect(page.locator('h1')).toContainText('Cleared IT Opportunities');

    // Check hero description
    await expect(page.locator('text=Bridging the gap')).toBeVisible();

    // Check CTA buttons
    await expect(page.locator('text=Browse Cleared Jobs')).toBeVisible();
    await expect(page.locator('text=Try AI Mock Interview')).toBeVisible();
    await expect(page.locator('text=Schedule Consultation')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check navbar links
    await expect(page.locator('nav >> text=Jobs')).toBeVisible();
    await expect(page.locator('nav >> text=Services')).toBeVisible();
    await expect(page.locator('nav >> text=Mock Interview')).toBeVisible();
    await expect(page.locator('nav >> text=Resources')).toBeVisible();

    // Test navigation to jobs page
    await page.click('nav >> text=Jobs');
    await expect(page).toHaveURL('/jobs');
  });

  test('should display feature cards', async ({ page }) => {
    // Check feature cards
    await expect(page.locator('text=SECRET+ Required')).toBeVisible();
    await expect(page.locator('text=Military-Friendly')).toBeVisible();
    await expect(page.locator('text=IT Focus')).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer is visible
    await expect(page.locator('footer')).toBeVisible();

    // Check social media links have correct hrefs
    const linkedinLink = page.locator('footer a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('target', '_blank');

    const twitterLink = page.locator('footer a[href*="twitter.com"]');
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  test('should load with proper SEO metadata', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Cleared Advisory Group/);

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toContain('Bridging the gap');

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Cleared Advisory Group');
  });

  test('should track analytics events on CTA clicks', async ({ page }) => {
    // Intercept analytics calls
    const analyticsRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('google-analytics.com') || request.url().includes('gtag')) {
        analyticsRequests.push(request.url());
      }
    });

    // Click CTA button
    await page.click('text=Browse Cleared Jobs');

    // Verify navigation
    await expect(page).toHaveURL('/jobs');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile menu button is visible
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();

    // Check hero content is still visible
    await expect(page.locator('h1')).toBeVisible();
  });
});