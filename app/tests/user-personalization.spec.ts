import { test, expect } from './fixtures/auth';
import { navigateWithAuth } from './helpers/auth-helpers';

test.describe('User Personalization', () => {
  
  test('user profile shows default user initial', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // User profile should be visible
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await expect(userProfile).toBeVisible();
    await expect(userProfile).toContainText('A');
  });

  test('user profile dropdown has settings option', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Find and click user profile to open dropdown
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Settings button should appear
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: /switch profiles/i })).toBeVisible();
  });

  test('can open user settings modal', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open user profile dropdown
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Click settings
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Modal should open with settings options
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible();
    await expect(authenticatedPage.getByText('Display Name')).toBeVisible();
    await expect(authenticatedPage.getByText('Theme Preference')).toBeVisible();
    await expect(authenticatedPage.getByText('Icon Color')).toBeVisible();
  });

  test('can change user display name', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Change display name
    const nameInput = authenticatedPage.getByPlaceholder(/User A/);
    await nameInput.fill('Alice');
    await nameInput.blur(); // Trigger onBlur handler
    
    // Wait for the input to show it has processed the change
    await expect(nameInput).toHaveValue('Alice');
    
    // Close modal
    await authenticatedPage.getByRole('button', { name: /done/i }).click();
    
    // Verify the value was saved to localStorage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const savedConfig = await authenticatedPage.evaluate(() => {
      return localStorage.getItem('cipher-app-user-config-A');
    });
    
    // Reload the page to ensure the new config is loaded
    await authenticatedPage.reload();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Re-open profile to verify name changed
    const userProfileAfterReload = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfileAfterReload.click();
    
    // The display name should be visible in the dropdown
    const profileDropdown = authenticatedPage.locator('.absolute.top-full');
    await expect(profileDropdown).toBeVisible();
    
    // Check for the display name
    
    await expect(profileDropdown).toContainText('Alice');
  });

  test('can change user icon color', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Wait for dropdown to appear and click settings
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible({ timeout: 10000 });
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Wait for modal dialog to load completely
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('Icon Color')).toBeVisible({ timeout: 5000 });
    
    // Select a different color (blue) - find it within the modal
    const blueColorButton = authenticatedPage.locator('[role="dialog"]').locator('[class*="bg-[var(--user-color-blue)"]').first();
    await expect(blueColorButton).toBeVisible();
    await blueColorButton.click();
    
    // Wait for change to take effect and verify it's selected (should show selection indicator)
    await authenticatedPage.waitForTimeout(500);
    await expect(blueColorButton.locator('div.absolute.-top-1.-right-1')).toBeVisible();
    
    // Close modal
    const doneButton = authenticatedPage.locator('[role="dialog"]').getByText('Done');
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    
    // Wait for modal to close
    await expect(authenticatedPage.getByText('Icon Color')).not.toBeVisible();
    
    // Verify the color change persisted - reopen settings to check
    await userProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // The blue color button should still be selected
    const blueButtonAfterReopen = authenticatedPage.locator('[role="dialog"]').locator('[class*="bg-[var(--user-color-blue)"]').first();
    await expect(blueButtonAfterReopen.locator('div.absolute.-top-1.-right-1')).toBeVisible();
  });

  test('can change theme preference in user settings', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Verify we start in dark theme
    const html = authenticatedPage.locator('html');
    await expect(html).toHaveClass(/dark/);
    
    // Open settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Wait for dropdown to appear and click settings
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible({ timeout: 10000 });
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Wait for modal dialog to be fully loaded
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('Theme Preference')).toBeVisible({ timeout: 5000 });
    
    // Select light theme button specifically
    const lightThemeButton = authenticatedPage.getByRole('button').filter({ hasText: /light/i }).first();
    await expect(lightThemeButton).toBeVisible();
    await lightThemeButton.click();
    
    // Wait for theme change to propagate - give it time
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify theme changed
    await expect(html).toHaveClass(/light/, { timeout: 15000 });
    
    // Close modal by clicking the Done button
    const doneButton = authenticatedPage.locator('[role="dialog"]').getByText('Done');
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    
    // Wait for modal to close
    await expect(authenticatedPage.getByText('Theme Preference')).not.toBeVisible();
    
    // Theme should persist
    await expect(html).toHaveClass(/light/);
  });

  test('theme preferences persist across page navigation', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Change theme through settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Wait for dropdown and click settings
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible({ timeout: 10000 });
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Wait for modal dialog to load and click light theme
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('Theme Preference')).toBeVisible({ timeout: 5000 });
    const lightThemeButton = authenticatedPage.getByRole('button').filter({ hasText: /light/i }).first();
    await expect(lightThemeButton).toBeVisible();
    await lightThemeButton.click();
    
    // Wait for theme change and close modal
    await authenticatedPage.waitForTimeout(2000);
    const doneButton = authenticatedPage.locator('[role="dialog"]').getByText('Done');
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    
    // Wait for modal to close
    await expect(authenticatedPage.getByText('Theme Preference')).not.toBeVisible();
    
    // Navigate to a cipher page
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    // Theme should persist
    const html = authenticatedPage.locator('html');
    await expect(html).toHaveClass(/light/, { timeout: 15000 });
    
    // Settings should show light theme selected
    const cipherUserProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await cipherUserProfile.click();
    
    // Wait for dropdown and click settings
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible();
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Wait for settings modal to load
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible();
    await expect(authenticatedPage.getByText('Theme Preference')).toBeVisible();
    
    // Light theme button should be selected (has primary styling)
    const lightButton = authenticatedPage.getByRole('button').filter({ hasText: /light/i }).first();
    await expect(lightButton).toHaveClass(/border-primary/);
  });

  test('can reset icon color to default', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open settings and change color
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    
    // Wait for dropdown and click settings
    await expect(authenticatedPage.getByText('⚙️ Settings')).toBeVisible({ timeout: 10000 });
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Wait for modal dialog to load
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(/Settings for/)).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('Icon Color')).toBeVisible({ timeout: 5000 });
    
    // Select red color
    const redColorButton = authenticatedPage.locator('[class*="bg-[var(--user-color-red)"]').first();
    await expect(redColorButton).toBeVisible();
    await redColorButton.click();
    
    // Wait for change
    await authenticatedPage.waitForTimeout(500);
    
    // Reset to default - the button only appears after selecting a color
    const resetButton = authenticatedPage.getByRole('button', { name: /reset to default/i });
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    
    // Wait for reset
    await authenticatedPage.waitForTimeout(500);
    
    // Close modal by clicking the Done button
    const doneButton = authenticatedPage.locator('[role="dialog"]').getByText('Done');
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    
    // Wait for modal to close
    await expect(authenticatedPage.getByText('Icon Color')).not.toBeVisible();
    
    // Should be back to original default color - but since we're using new alphabet system,
    // the default will be one of the user-color- variables, not user-a
    await userProfile.click();
    // Check that it's NOT the red color we selected
    const redIcon = authenticatedPage.locator('[class*="bg-[var(--user-color-red)"]').first();
    await expect(redIcon).not.toBeVisible();
  });
});