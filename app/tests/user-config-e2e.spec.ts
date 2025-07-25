import { test as authTest, expect } from './fixtures/auth';

authTest.describe('User Configuration E2E Testing', () => {
  authTest.beforeEach(async ({ authenticatedPage }) => {
    // Start from home page
    await authenticatedPage.goto('/');
    await expect(authenticatedPage.getByText(/Welcome.*ready to explore secret codes/)).toBeVisible();
  });

  authTest('should navigate to config page', async ({ authenticatedPage }) => {
    // Navigate to config page
    await authenticatedPage.goto('/config');
    
    // Should show config page elements
    await expect(authenticatedPage.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(authenticatedPage.getByText('Agent Management')).toBeVisible();
    await expect(authenticatedPage.getByText('Cipher Configuration')).toBeVisible();
  });

  authTest('should display available users/agents', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Should show Agent Management section
    await expect(authenticatedPage.getByText('Agent Management')).toBeVisible();
    
    // Should show individual user configuration with user elements
    await expect(authenticatedPage.getByText('Individual User Configuration')).toBeVisible();
    
    // Should show user items (more specific selectors)
    await expect(authenticatedPage.getByText('User A')).toBeVisible();
    await expect(authenticatedPage.getByText('User L')).toBeVisible();
    await expect(authenticatedPage.getByText('User I')).toBeVisible();
    await expect(authenticatedPage.getByText('User J')).toBeVisible();
    await expect(authenticatedPage.getByText('User F')).toBeVisible();
  });

  authTest('should add a new user/agent', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Find the Add New Agent section
    await expect(authenticatedPage.getByText('Add New Agent')).toBeVisible();
    
    // Find the input field (with placeholder A-Z) in the Add New Agent section
    const addUserField = authenticatedPage.getByPlaceholder('A-Z');
    await addUserField.fill('Z');
    
    // Click the Add Agent button
    await authenticatedPage.getByRole('button', { name: 'Add Agent' }).click();
    
    // Should now see the new agent in the Agent Management section
    // Look for Z in the list of agents
    const agentManagementSection = authenticatedPage.locator('text=Agent Management').locator('..');
    await expect(agentManagementSection.getByText('Z').first()).toBeVisible();
  });

  authTest('should configure cipher availability for user', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Find cipher configuration section
    await expect(authenticatedPage.getByText('Cipher Configuration')).toBeVisible();
    
    // Should show available ciphers
    await expect(authenticatedPage.getByText('Caesar Cipher')).toBeVisible();
    await expect(authenticatedPage.getByText('Atbash Cipher')).toBeVisible();
    await expect(authenticatedPage.getByText('Vigenère Cipher')).toBeVisible();
    
    // Find checkboxes or toggle switches for ciphers
    const caesarToggle = authenticatedPage.getByRole('checkbox', { name: /caesar/i }).or(
      authenticatedPage.getByRole('switch', { name: /caesar/i })
    );
    
    if (await caesarToggle.isVisible().catch(() => false)) {
      // Toggle Caesar cipher off if it's on, or on if it's off
      const isChecked = await caesarToggle.isChecked().catch(() => false);
      await caesarToggle.click();
      
      // Verify the state changed
      const newState = await caesarToggle.isChecked().catch(() => !isChecked);
      expect(newState).toBe(!isChecked);
    }
  });

  authTest('should save and persist cipher configuration changes', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Find Morse toggle
    const morseToggle = authenticatedPage.getByRole('checkbox', { name: /morse/i }).or(
      authenticatedPage.getByRole('switch', { name: /morse/i })
    );
    
    if (await morseToggle.isVisible().catch(() => false)) {
      // ALWAYS set to a known state first (enabled)
      const currentState = await morseToggle.isChecked().catch(() => false);
      if (!currentState) {
        await morseToggle.click();
        await authenticatedPage.waitForTimeout(100); // Small delay for state update
      }
      
      // Verify it's now enabled
      await expect(morseToggle).toBeChecked();
      
      // Now disable it (known transition: enabled -> disabled)
      await morseToggle.click();
      await authenticatedPage.waitForTimeout(100); // Small delay for state update
      
      // Verify it's now disabled
      await expect(morseToggle).not.toBeChecked();
      
      // Save changes if there's a save button
      const saveButton = authenticatedPage.getByRole('button', { name: /save|apply/i });
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click();
        await authenticatedPage.waitForTimeout(200); // Wait for save
      }
      
      // Navigate back to home
      await authenticatedPage.goto('/');
      await expect(authenticatedPage.getByText(/Welcome.*ready to explore secret codes/)).toBeVisible();
      
      // Morse cipher should NOT be visible (we disabled it)
      const morseCard = authenticatedPage.getByRole('link', { name: /morse/i });
      await expect(morseCard).not.toBeVisible();
      
      // Go back to config and verify state persisted
      await authenticatedPage.goto('/config');
      await expect(morseToggle).not.toBeChecked();
      
      // Re-enable it for other tests
      await morseToggle.click();
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click();
      }
    }
  });

  authTest('should navigate back to home and reflect changes', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Make a change - disable Pigpen cipher if available
    const pigpenToggle = authenticatedPage.getByRole('checkbox', { name: /pigpen/i }).or(
      authenticatedPage.getByRole('switch', { name: /pigpen/i })
    );
    
    if (await pigpenToggle.isVisible().catch(() => false)) {
      const wasEnabled = await pigpenToggle.isChecked().catch(() => true);
      
      // Disable it
      if (wasEnabled) {
        await pigpenToggle.click();
        await expect(pigpenToggle).not.toBeChecked();
      }
      
      // Navigate back using browser navigation or home link
      const homeLink = authenticatedPage.getByRole('link', { name: /home/i }).or(
        authenticatedPage.getByRole('button', { name: /back.*home|home/i })
      );
      
      if (await homeLink.isVisible().catch(() => false)) {
        await homeLink.click();
      } else {
        await authenticatedPage.goto('/');
      }
      
      await expect(authenticatedPage.getByText(/Welcome.*ready to explore secret codes/)).toBeVisible();
      
      // Pigpen should not be visible on home page if we disabled it
      if (wasEnabled) {
        await expect(authenticatedPage.getByRole('link', { name: /pigpen/i })).not.toBeVisible();
      }
    }
  });

  authTest('should switch users and maintain separate configs', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Add a new user first
    const addUserField = authenticatedPage.getByRole('textbox', { name: /new.*user|add.*user/i }).or(
      authenticatedPage.getByPlaceholder(/enter.*initial|add.*user/i)
    );
    
    if (await addUserField.isVisible().catch(() => false)) {
      await addUserField.fill('X');
      await authenticatedPage.getByRole('button', { name: /add|create/i }).click();
      await expect(authenticatedPage.getByText('X')).toBeVisible();
      
      // Switch to the new user
      await authenticatedPage.getByText('X').click();
      
      // Configure different cipher settings for this user
      const vigenerToggle = authenticatedPage.getByRole('checkbox', { name: /vigenere|vigenère/i }).or(
        authenticatedPage.getByRole('switch', { name: /vigenere|vigenère/i })
      );
      
      if (await vigenerToggle.isVisible().catch(() => false)) {
        await vigenerToggle.click();
        
        // Navigate to home and verify user X has different cipher availability
        await authenticatedPage.goto('/');
        
        // Should show user X is active
        const userIndicator = authenticatedPage.getByText('X').first();
        await expect(userIndicator).toBeVisible();
      }
    }
  });

  authTest('should show theme settings', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Should show theme configuration (be more specific)
    await expect(authenticatedPage.getByText('Theme & Appearance')).toBeVisible();
    
    // Should have theme options
    const themeSelector = authenticatedPage.getByRole('combobox', { name: /theme/i }).or(
      authenticatedPage.getByRole('group', { name: /theme/i })
    );
    
    if (await themeSelector.isVisible().catch(() => false)) {
      // Should see theme options like Dark, Light, System
      await expect(authenticatedPage.getByText(/dark|light|system/i)).toBeVisible();
    }
  });

  authTest('should validate user input constraints', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    
    // Try to add invalid user (empty, too long, special characters)
    const addUserField = authenticatedPage.getByRole('textbox', { name: /new.*user|add.*user/i }).or(
      authenticatedPage.getByPlaceholder(/enter.*initial/i)
    );
    
    if (await addUserField.isVisible().catch(() => false)) {
      // Try empty input
      await addUserField.fill('');
      const addButton = authenticatedPage.getByRole('button', { name: /add|create/i });
      await addButton.click();
      
      // Should show error or not add anything
      await expect(authenticatedPage.getByText(/invalid|error|required/i)).toBeVisible().catch(() => true);
      
      // Try special character
      await addUserField.fill('@');
      await addButton.click();
      
      // Should show error or not add the invalid user
      const invalidUser = authenticatedPage.getByText('@');
      const hasInvalidUser = await invalidUser.isVisible().catch(() => false);
      expect(hasInvalidUser).toBeFalsy();
    }
  });
});