import { test, expect } from '@playwright/test';

test.describe('Simple Modal Test', () => {
  test('check what happens when theme changes', async ({ page }) => {
    const logs: string[] = [];
    
    // Capture all console messages
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    
    // Select user A
    const userButton = page.locator('button[aria-label*="Select user A"]');
    await userButton.click();
    
    // Open user profile menu
    const userProfile = page.locator('div.flex.items-center.gap-2.relative.cursor-pointer');
    await userProfile.hover();
    
    // Click Settings
    const settingsButton = page.getByRole('button', { name: '⚙️ Settings' });
    await settingsButton.click();
    
    // Wait for modal to be fully open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Take screenshot before theme change
    await page.screenshot({ path: 'before-theme-change.png' });
    
    console.log('Modal is open, attempting theme change...');
    
    // Try clicking Matrix theme and see what happens step by step
    const matrixButton = page.locator('button:has-text("Matrix")');
    await expect(matrixButton).toBeVisible();
    
    console.log('About to click Matrix theme button...');
    await matrixButton.click();
    
    // Immediately check if modal is still there
    await page.waitForTimeout(100);
    const modalStillVisible = await modal.isVisible();
    console.log(`Modal visible after 100ms: ${modalStillVisible}`);
    
    // Check after a bit more time
    await page.waitForTimeout(500);
    const modalVisible500ms = await modal.isVisible();
    console.log(`Modal visible after 500ms: ${modalVisible500ms}`);
    
    // Take screenshot after theme change
    await page.screenshot({ path: 'after-theme-change.png' });
    
    // Check if theme actually changed
    const htmlElement = page.locator('html');
    const htmlClass = await htmlElement.getAttribute('class');
    console.log(`HTML class after theme change: ${htmlClass}`);
    
    // Log all console messages
    console.log('Console logs:', logs);
  });
});