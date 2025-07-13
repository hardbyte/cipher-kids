import { test, expect } from './fixtures/auth';

test.describe('User Settings Modal', () => {
  test('should remain open when interacting with its content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    
    // Open user profile menu
    const userProfile = authenticatedPage.locator('div.flex.items-center.gap-2.relative.cursor-pointer');
    await userProfile.hover();
    
    // Click Settings
    const settingsButton = authenticatedPage.getByRole('button', { name: '⚙️ Settings' });
    await settingsButton.click();
    
    // Wait for modal to be fully open
    const settingsModal = authenticatedPage.locator('[role="dialog"]');
    await expect(settingsModal).toBeVisible();
    
    // Test 1: Click on theme button
    const lightTheme = authenticatedPage.locator('button:has-text("Light")');
    await lightTheme.click();
    await expect(settingsModal).toBeVisible();

    // Test 2: Click on icon color button
    const iconColorButton = authenticatedPage.locator('button[title="Red"]').first();
    await iconColorButton.click();
    await expect(settingsModal).toBeVisible();

    // Test 3: Click on avatar change button
    const avatarButton = authenticatedPage.locator('button:has-text("Choose Avatar")');
    await avatarButton.click();
    
    // Avatar picker modal should be visible
    const avatarPickerModal = authenticatedPage.locator('[role="dialog"]', { hasText: 'Choose Your Avatar' });
    await expect(avatarPickerModal).toBeVisible();

    // Close avatar picker
    await avatarPickerModal.getByRole('button', { name: 'Cancel' }).click();
    await expect(avatarPickerModal).not.toBeVisible();

    // Settings modal should still be visible
    await expect(settingsModal).toBeVisible();

    // Close settings modal
    await settingsModal.getByRole('button', { name: 'Done' }).click();
    await expect(settingsModal).not.toBeVisible();
  });
});
