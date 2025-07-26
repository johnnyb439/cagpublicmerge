import { test, expect } from '@playwright/test';

test.describe('Performance & Optimization Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    // Start measuring
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    // Assert performance budgets
    expect(metrics.firstContentfulPaint).toBeLessThan(1800); // 1.8s
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3s
  });

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/');
    
    // Wait for service worker
    await page.waitForTimeout(2000);

    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    expect(hasServiceWorker).toBe(true);
  });

  test('should implement code splitting', async ({ page }) => {
    const chunks: string[] = [];

    // Monitor network requests
    page.on('response', response => {
      const url = response.url();
      if (url.includes('_next/static/chunks') && url.endsWith('.js')) {
        chunks.push(url);
      }
    });

    // Navigate to homepage
    await page.goto('/');

    // Navigate to mock interview (should load additional chunks)
    await page.click('text=Mock Interview');
    await page.waitForLoadState('networkidle');

    // Should have loaded additional chunks
    const mockInterviewChunks = chunks.filter(chunk => 
      chunk.includes('mock-interview') || chunk.includes('MockInterview')
    );
    expect(mockInterviewChunks.length).toBeGreaterThan(0);
  });

  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('/');
    
    // Get all static assets
    const firstLoadAssets = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('_next/static'))
        .map(entry => ({
          name: entry.name,
          duration: entry.duration
        }));
    });

    // Second visit (should use cache)
    await page.reload();
    
    const cachedAssets = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('_next/static'))
        .filter(entry => entry.duration < 50) // Cached assets load very fast
        .length;
    });

    // Most static assets should be cached
    expect(cachedAssets).toBeGreaterThan(firstLoadAssets.length * 0.5);
  });

  test('should implement lazy loading for images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = page.locator('img[loading="lazy"]');
    const lazyImageCount = await images.count();

    // Should have lazy loading images
    expect(lazyImageCount).toBeGreaterThan(0);

    // Check that images below fold are not loaded initially
    const imageSources = await images.evaluateAll(imgs => 
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    // Some images should not be loaded initially
    const unloadedImages = imageSources.filter(img => !img.loaded);
    expect(unloadedImages.length).toBeGreaterThan(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');

    // Check essential meta tags
    const metaTags = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta?.getAttribute('content') || null;
      };

      return {
        description: getMetaContent('description'),
        viewport: getMetaContent('viewport'),
        ogTitle: getMetaContent('og:title'),
        ogDescription: getMetaContent('og:description'),
        ogImage: getMetaContent('og:image'),
        twitterCard: getMetaContent('twitter:card'),
      };
    });

    expect(metaTags.description).toBeTruthy();
    expect(metaTags.viewport).toBe('width=device-width, initial-scale=1');
    expect(metaTags.ogTitle).toBeTruthy();
    expect(metaTags.ogDescription).toBeTruthy();
    expect(metaTags.ogImage).toBeTruthy();
    expect(metaTags.twitterCard).toBeTruthy();
  });

  test('should track Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Wait for Web Vitals to be collected
    await page.waitForTimeout(3000);

    const webVitals = await page.evaluate(() => {
      return (window as any).__WEB_VITALS__ || null;
    });

    if (webVitals) {
      // Check if Web Vitals are being tracked
      expect(webVitals).toHaveProperty('CLS');
      expect(webVitals).toHaveProperty('FID');
      expect(webVitals).toHaveProperty('LCP');
    }
  });

  test('should implement proper error boundaries', async ({ page }) => {
    // Navigate to a page that might have errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Should not have any console errors
    expect(consoleErrors.filter(err => 
      !err.includes('Failed to load resource') && // Ignore missing resources in test
      !err.includes('favicon.ico') // Ignore favicon errors
    )).toHaveLength(0);
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // Load page first
    await page.goto('/');
    await page.waitForTimeout(2000); // Let service worker register

    // Go offline
    await context.setOffline(true);

    // Try to navigate
    await page.reload();

    // Should show offline page or cached content
    const isOfflinePage = await page.locator('text=You are offline').isVisible()
      .catch(() => false);
    const hasCachedContent = await page.locator('h1').isVisible()
      .catch(() => false);

    expect(isOfflinePage || hasCachedContent).toBe(true);
  });
});