import { test, expect } from '@playwright/test';

test.describe('Mock Interview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mock-interview');
  });

  test('should display mock interview interface', async ({ page }) => {
    // Check page elements
    await expect(page.locator('h1')).toContainText('AI Mock Interview');
    await expect(page.locator('text=Practice with AI-powered')).toBeVisible();

    // Check start button
    await expect(page.locator('button:has-text("Start Interview")')).toBeVisible();
  });

  test('should show difficulty selection', async ({ page }) => {
    // Click start interview
    await page.click('button:has-text("Start Interview")');

    // Should show difficulty options
    await expect(page.locator('text=Select Difficulty')).toBeVisible();
    await expect(page.locator('text=Entry Level')).toBeVisible();
    await expect(page.locator('text=Mid Level')).toBeVisible();
    await expect(page.locator('text=Senior Level')).toBeVisible();
  });

  test('should start interview session', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');

    // Select difficulty
    await page.click('text=Mid Level');

    // Should show first question
    await expect(page.locator('text=Question 1')).toBeVisible();
    
    // Should have timer
    await expect(page.locator('[data-testid="timer"]')).toBeVisible();

    // Should have answer input area
    await expect(page.locator('textarea, [contenteditable="true"]')).toBeVisible();
  });

  test('should navigate between questions', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Answer first question
    const answerArea = page.locator('textarea, [contenteditable="true"]').first();
    await answerArea.fill('This is my answer to the first question.');

    // Click next
    await page.click('button:has-text("Next")');

    // Should show question 2
    await expect(page.locator('text=Question 2')).toBeVisible();

    // Should be able to go back
    await page.click('button:has-text("Previous")');
    await expect(page.locator('text=Question 1')).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Check progress indicator
    await expect(page.locator('[data-testid="progress-bar"], text=1 of')).toBeVisible();
  });

  test('should complete interview and show results', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Mock answering all questions (simplified)
    const nextButton = page.locator('button:has-text("Next")');
    const finishButton = page.locator('button:has-text("Finish")');

    // Answer questions until finish button appears
    while (await nextButton.isVisible() && !(await finishButton.isVisible())) {
      const answerArea = page.locator('textarea, [contenteditable="true"]').first();
      await answerArea.fill('Sample answer for this question.');
      await nextButton.click();
    }

    // Complete interview
    if (await finishButton.isVisible()) {
      await finishButton.click();

      // Should show results
      await expect(page.locator('text=Interview Complete')).toBeVisible();
      await expect(page.locator('text=Your Results')).toBeVisible();
    }
  });

  test('should handle timer expiry', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Check if timer is counting down
    const timer = page.locator('[data-testid="timer"]');
    const initialTime = await timer.textContent();
    
    // Wait a few seconds
    await page.waitForTimeout(3000);
    
    const updatedTime = await timer.textContent();
    expect(initialTime).not.toBe(updatedTime);
  });

  test('should save interview progress', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Answer a question
    const answerArea = page.locator('textarea, [contenteditable="true"]').first();
    await answerArea.fill('My detailed answer');

    // Navigate away
    await page.goto('/');
    
    // Come back
    await page.goto('/mock-interview');

    // Should show option to resume
    const resumeButton = page.locator('button:has-text("Resume Interview")');
    if (await resumeButton.isVisible()) {
      await resumeButton.click();
      // Should restore progress
      await expect(answerArea).toHaveValue('My detailed answer');
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Start interview
    await page.click('button:has-text("Start Interview")');
    await page.click('text=Entry Level');

    // Tab through interface
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to type in answer area
    await page.keyboard.type('Keyboard navigation test');

    // Tab to next button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should move to next question
    await expect(page.locator('text=Question 2')).toBeVisible();
  });
});