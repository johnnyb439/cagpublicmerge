import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form with role toggle', async ({ page }) => {
    // Check form elements
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Check role toggle
    await expect(page.locator('text=Job Seeker')).toBeVisible();
    await expect(page.locator('text=Employer')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Log In")');

    // Check for validation error
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show error for empty fields', async ({ page }) => {
    // Click login without filling fields
    await page.click('button:has-text("Log In")');

    // Check for validation error
    await expect(page.locator('text=Please enter both email and password')).toBeVisible();
  });

  test('should toggle between job seeker and employer', async ({ page }) => {
    // Default should be job seeker
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('placeholder', 'john.doe@email.com');

    // Click employer button
    await page.click('text=Employer');

    // Placeholder should change
    await expect(emailInput).toHaveAttribute('placeholder', 'recruiter@company.com');
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Fill valid credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Click login
    await page.click('button:has-text("Log In")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should have working forgot password link', async ({ page }) => {
    // Click forgot password
    await page.click('text=Forgot your password?');

    // Should navigate to forgot password page
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should have working sign up link', async ({ page }) => {
    // Click sign up link
    await page.click('text=Sign up');

    // Should navigate to register page
    await expect(page).toHaveURL('/register');
  });

  test('should store user session in localStorage', async ({ page }) => {
    // Fill and submit form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button:has-text("Log In")');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Check localStorage
    const userSession = await page.evaluate(() => localStorage.getItem('cag_user'));
    expect(userSession).toBeTruthy();
  });
});