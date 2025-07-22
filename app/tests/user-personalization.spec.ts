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
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Select a different color (blue)
    const blueColorButton = authenticatedPage.locator('[class*="bg-[var(--user-color-blue)"]').first();
    await blueColorButton.click();
    
    // Close modal
    await authenticatedPage.getByRole('button', { name: /done/i }).click();
    
    // Verify the user icon color changed
    await userProfile.click();
    const userIcon = authenticatedPage.locator('[class*="bg-[var(--user-color-blue)"]').first();
    await expect(userIcon).toBeVisible();
  });

  test('can change theme preference in user settings', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Select light theme
    await authenticatedPage.getByRole('button', { name: /light/i }).first().click();
    
    // Verify theme changed
    const html = authenticatedPage.locator('html');
    await expect(html).toHaveClass(/light/);
    
    // Close modal
    await authenticatedPage.getByRole('button', { name: /done/i }).click();
    
    // Theme should persist
    await expect(html).toHaveClass(/light/);
  });

  test('theme preferences persist across page navigation', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Change theme through settings
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    await authenticatedPage.getByRole('button', { name: /light/i }).first().click();
    await authenticatedPage.getByRole('button', { name: /done/i }).click();
    
    // Navigate to a cipher page
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    // Theme should persist
    const html = authenticatedPage.locator('html');
    await expect(html).toHaveClass(/light/);
    
    // Settings should show light theme selected
    const cipherUserProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await cipherUserProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Light theme button should be selected (has primary styling)
    const lightButton = authenticatedPage.getByRole('button', { name: /light/i }).first();
    await expect(lightButton).toHaveClass(/border-primary/);
  });

  test('can reset icon color to default', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Open settings and change color
    const userProfile = authenticatedPage.locator('[class*="bg-[var(--user"]').first();
    await userProfile.click();
    await authenticatedPage.getByText('⚙️ Settings').click();
    
    // Select red color
    const redColorButton = authenticatedPage.locator('[class*="bg-[var(--user-color-red)"]').first();
    await redColorButton.click();
    
    // Reset to default
    await authenticatedPage.getByRole('button', { name: /reset to default/i }).click();
    
    // Close modal
    await authenticatedPage.getByRole('button', { name: /done/i }).click();
    
    // Should be back to original default color
    await userProfile.click();
    const defaultIcon = authenticatedPage.locator('[class*="bg-[var(--user-a)"]').first();
    await expect(defaultIcon).toBeVisible();
  });
});