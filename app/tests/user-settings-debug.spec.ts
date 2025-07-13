import { test, expect } from './test';

test.describe('User Settings Debug', () => {
  test('test user settings theme change behavior', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', msg => {
      const message = `Console ${msg.type()}: ${msg.text()}`;
      console.log(message);
      consoleMessages.push(message);
    });

    page.on('pageerror', error => {
      const message = `Page error: ${error.message}`;
      console.log(message);
      pageErrors.push(message);
    });

    // Go to the app
    await page.goto('/');
    
    // Look for user selection buttons - they should have aria-label
    const userButton = page.locator('button[aria-label*="Select user A"]');
    await expect(userButton).toBeVisible({ timeout: 10000 });
    await userButton.click();
    
    // Wait for navigation to complete - should stay on / but now show cipher tools
    await expect(page).toHaveURL('/');
    
    // Take screenshot of current state
    await page.screenshot({ path: 'debug-1-after-login.png' });
    
    // Find the user profile in the header - should be hoverable
    const userProfile = page.locator('div.flex.items-center.gap-2.relative.cursor-pointer');
    await expect(userProfile).toBeVisible();
    
    // Hover to open the profile menu
    await userProfile.hover();
    
    // Wait for hover menu to appear and click Settings
    const settingsButton = page.getByRole('button', { name: '⚙️ Settings' });
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // Take screenshot of modal
    await page.screenshot({ path: 'debug-2-modal-open.png' });
    
    // Wait for modal to be fully open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Try to click on a theme option - let's try the Matrix theme
    const matrixTheme = page.locator('button:has-text("Matrix")');
    await expect(matrixTheme).toBeVisible();
    
    console.log('About to click Matrix theme...');
    await matrixTheme.click();
    
    // Wait a moment to see what happens
    await page.waitForTimeout(2000);
    
    // Take screenshot after theme change
    await page.screenshot({ path: 'debug-3-after-theme-change.png' });
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after theme change: ${currentUrl}`);
    
    // Check if modal is still open
    const modal = page.locator('[role="dialog"]');
    const isModalOpen = await modal.isVisible();
    console.log(`Modal still open: ${isModalOpen}`);
    
    // The modal should still be open and we should still be on the home page
    expect(currentUrl).toBe(page.url());
    expect(isModalOpen).toBe(true);
    
    // Check for any console errors
    console.log('Console messages:', consoleMessages);
    console.log('Page errors:', pageErrors);
    
    // Fail test if there were page errors
    if (pageErrors.length > 0) {
      throw new Error(`Page errors found: ${pageErrors.join(', ')}`);
    }
  });
});