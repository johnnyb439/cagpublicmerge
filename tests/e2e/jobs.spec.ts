import { test, expect } from '@playwright/test';

test.describe('Jobs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  test('should display job listings', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Cleared IT Jobs');

    // Check job cards are visible
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards.first()).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'developer');
    
    // Press Enter or click search
    await page.press('input[placeholder*="Search"]', 'Enter');

    // URL should update with search param
    await expect(page).toHaveURL(/search=developer/);
  });

  test('should have working clearance filter', async ({ page }) => {
    // Click on clearance filter
    await page.click('button:has-text("Clearance Level")');

    // Select SECRET clearance
    await page.click('text=SECRET');

    // URL should update
    await expect(page).toHaveURL(/clearance=SECRET/);
  });

  test('should have working location filter', async ({ page }) => {
    // Click on location filter
    await page.click('button:has-text("Location")');

    // Select a location
    await page.click('text=Washington, DC');

    // URL should update
    await expect(page).toHaveURL(/location=Washington/);
  });

  test('should have working salary range filter', async ({ page }) => {
    // Look for salary range slider
    const salarySlider = page.locator('input[type="range"]');
    
    if (await salarySlider.isVisible()) {
      // Adjust salary range
      await salarySlider.fill('120000');
      
      // Check if display updates
      await expect(page.locator('text=$120,000')).toBeVisible();
    }
  });

  test('should allow job comparison', async ({ page }) => {
    // Select multiple jobs for comparison
    const compareCheckboxes = page.locator('input[type="checkbox"][name*="compare"]');
    
    // Select first two jobs
    await compareCheckboxes.nth(0).check();
    await compareCheckboxes.nth(1).check();

    // Compare button should appear
    await expect(page.locator('button:has-text("Compare")')).toBeVisible();

    // Click compare
    await page.click('button:has-text("Compare")');

    // Should show comparison modal or navigate to comparison page
    await expect(page.locator('text=Job Comparison')).toBeVisible();
  });

  test('should have working job alerts', async ({ page }) => {
    // Click on a job card
    await page.locator('[data-testid="job-card"]').first().click();

    // Wait for job detail page
    await page.waitForSelector('text=Set Alert');

    // Click Set Alert button
    await page.click('button:has-text("Set Alert")');

    // Alert modal should appear
    await expect(page.locator('text=Job Alert Settings')).toBeVisible();
  });

  test('should persist filters in URL', async ({ page }) => {
    // Apply multiple filters
    await page.fill('input[placeholder*="Search"]', 'engineer');
    await page.press('input[placeholder*="Search"]', 'Enter');

    // Add clearance filter
    await page.click('button:has-text("Clearance Level")');
    await page.click('text=TOP SECRET');

    // Reload page
    await page.reload();

    // Filters should persist
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('engineer');
    await expect(page).toHaveURL(/search=engineer/);
    await expect(page).toHaveURL(/clearance=TOP_SECRET/);
  });

  test('should have working pagination', async ({ page }) => {
    // Look for pagination controls
    const nextButton = page.locator('button:has-text("Next")');
    
    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();

      // URL should update
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('should show job details on click', async ({ page }) => {
    // Click on first job
    await page.locator('[data-testid="job-card"]').first().click();

    // Should navigate to job detail page
    await expect(page).toHaveURL(/\/jobs\/\d+/);

    // Should show job details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Job Description')).toBeVisible();
    await expect(page.locator('text=Requirements')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Filters should be in a collapsible menu
    await expect(page.locator('button:has-text("Filters")')).toBeVisible();

    // Job cards should stack vertically
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards.first()).toBeVisible();
  });
});