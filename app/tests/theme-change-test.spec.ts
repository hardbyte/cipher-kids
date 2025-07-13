import { test, expect } from '@playwright/test';

test.describe('Theme Change Behavior', () => {
  test('theme changes should not close modals or navigate away', async ({ page }) => {
    // Go to the app
    await page.goto('/');
    
    // Select user A
    const userButton = page.locator('button[aria-label*="Select user A"]');
    await expect(userButton).toBeVisible();
    await userButton.click();
    
    // Should be on home page showing cipher tools
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1:has-text("Cipher Tools")')).toBeVisible();
    
    // Open user profile hover menu
    const userProfile = page.locator('div.flex.items-center.gap-2.relative.cursor-pointer');
    await userProfile.hover();
    
    // Click Settings to open modal
    const settingsButton = page.getByRole('button', { name: '⚙️ Settings' });
    await settingsButton.click();
    
    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Record current URL
    const initialUrl = page.url();
    
    // Change to Matrix theme
    const matrixTheme = page.locator('button:has-text("Matrix")');
    await matrixTheme.click();
    
    // Brief wait for theme change
    await page.waitForTimeout(500);
    
    // Verify modal is STILL open (this is the key test)
    await expect(modal).toBeVisible();
    
    // Verify we're still on the same page
    expect(page.url()).toBe(initialUrl);
    
    // Verify theme actually changed by checking root class
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/matrix/);
  });
});