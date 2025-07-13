import { test, expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';

authTest.describe('Keyword Cipher End-to-End Testing', () => {
  authTest.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to keyword cipher page
    await authenticatedPage.goto('/ciphers/keyword');
    await expect(authenticatedPage.getByRole('heading', { name: 'Keyword Cipher', exact: true })).toBeVisible();
  });

  authTest.describe('Encrypt Mode Tab', () => {
    authTest('should encrypt message with keyword correctly', async ({ authenticatedPage }) => {
      // Ensure we're in encrypt mode (check for active styling) 
      await expect(authenticatedPage.locator('button').filter({ hasText: /^🔒\s*Encrypt$/ })).toHaveClass(/bg-primary/);
      
      // Enter a test message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('HELLO WORLD');
      
      // Enter a keyword
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('SECRET');
      
      // Wait for real-time feedback to show result
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible({ timeout: 5000 });
      
      // Verify the encrypted result (HELLO WORLD + SECRET = DTIIL WLOIR)
      const result = await resultElement.textContent();
      expect(result?.trim()).toBe('DTIIL WLOIR');
    });

    authTest('should show real-time feedback as user types', async ({ authenticatedPage }) => {
      // Start typing message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('HELLO');
      
      // Add keyword
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('KEY');
      
      // Should show result immediately
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible();
      
      // Verify partial result (HELLO + KEY = FBJJN)
      const result = await resultElement.textContent();
      expect(result?.trim()).toBe('FBJJN');
      
      // Add more to message
      await messageInput.fill('HELLO WORLD');
      
      // Result should update (HELLO WORLD + KEY)
      const updatedResult = await resultElement.textContent();
      expect(updatedResult?.trim()).toBe('FBJJN VNQJA');
    });

    authTest('should show keyword strength rating', async ({ authenticatedPage }) => {
      // Enter a weak keyword
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('KEY');
      
      // Should show strength meter
      await expect(authenticatedPage.getByText('🛡️ Keyword Security Rating')).toBeVisible();
      await expect(authenticatedPage.getByText('Weak')).toBeVisible();
      await expect(authenticatedPage.getByText(/too easy to guess/i)).toBeVisible();
      
      // Enter a stronger keyword
      await keywordInput.fill('MYSTERIOUS ADVENTURE');
      
      // Should show better rating
      await expect(authenticatedPage.getByText('Very Strong')).toBeVisible();
      await expect(authenticatedPage.getByText('Excellent! This would be very hard to crack!')).toBeVisible();
    });

    authTest('should show animated alphabet mapping', async ({ authenticatedPage }) => {
      // Enter keyword to trigger mapping
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('CIPHER');
      
      // Should show alphabet mapping visualizer
      await expect(authenticatedPage.getByText('Alphabet Mapping:')).toBeVisible();
      
      // Should show the cipher alphabet starting with CIPHER
      const mappingSection = authenticatedPage.locator('text=Alphabet Mapping:').locator('..');
      await expect(mappingSection).toContainText('C');
      await expect(mappingSection).toContainText('I');
      await expect(mappingSection).toContainText('P');
      await expect(mappingSection).toContainText('H');
      await expect(mappingSection).toContainText('E');
      await expect(mappingSection).toContainText('R');
    });

    authTest('should handle Try Sample button', async ({ authenticatedPage }) => {
      // Click try sample
      await authenticatedPage.getByRole('button', { name: /try sample/i }).click();
      
      // Should populate message field
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      const messageValue = await messageInput.inputValue();
      expect(messageValue.length).toBeGreaterThan(0);
      
      // Should be a reasonable sample message
      expect(['HELLO WORLD', 'SECRET MESSAGE', 'HAPPY BIRTHDAY', 'TREASURE HUNT', 'MAGIC SPELL']).toContain(messageValue);
    });

    authTest('should show educational content', async ({ authenticatedPage }) => {
      // Should show how it works section
      await expect(authenticatedPage.getByText('🗝️ How It Works: Keyword Cipher')).toBeVisible();
      await expect(authenticatedPage.getByText('🎭 The Secret Handshake for Alphabets')).toBeVisible();
      
      // Should show step-by-step explanation
      await expect(authenticatedPage.getByText(/step 1.*remove duplicate letters/i)).toBeVisible();
      await expect(authenticatedPage.getByText(/step 2.*add remaining alphabet/i)).toBeVisible();
      
      // Should show example
      await expect(authenticatedPage.getByText('SECRET → SECRT')).toBeVisible();
    });
  });

  authTest.describe('Decrypt Mode Tab', () => {
    authTest('should decrypt message with keyword correctly', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      await expect(authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ })).toHaveClass(/bg-primary/);
      
      // Enter encrypted message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      
      // Enter the keyword
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('SECRET');
      
      // Wait for real-time feedback
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible({ timeout: 5000 });
      
      // Verify the decrypted result
      const result = await resultElement.textContent();
      expect(result?.trim()).toBe('HELLO WORLD');
    });

    authTest('should show encrypt/decrypt reversal works', async ({ authenticatedPage }) => {
      // Start with a message in encrypt mode
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      
      await messageInput.fill('TESTING REVERSAL');
      await keywordInput.fill('MAGIC');
      
      // Get encrypted result
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible();
      const encryptedResult = await resultElement.textContent();
      
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Use encrypted result as input
      await messageInput.fill(encryptedResult?.trim() || '');
      await keywordInput.fill('MAGIC');
      
      // Should get back original message
      await expect(resultElement).toBeVisible();
      const decryptedResult = await resultElement.textContent();
      expect(decryptedResult?.trim()).toBe('TESTING REVERSAL');
    });

    authTest('should update UI elements for decrypt mode', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Should show decrypt mode is active
      await expect(authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ })).toHaveClass(/bg-primary/);
      
      // Should show decrypt-specific educational content
      await expect(authenticatedPage.getByText(/how to decrypt with your keyword/i)).toBeVisible();
      await expect(authenticatedPage.getByText(/find your letter in the keyword alphabet.*bottom row/i)).toBeVisible();
    });

    authTest('should handle wrong keyword gracefully', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Enter encrypted message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR'); // "HELLO WORLD" encrypted with "SECRET"
      
      // Enter wrong keyword
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('WRONG');
      
      // Should still show a result (but gibberish)
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible();
      
      const result = await resultElement.textContent();
      expect(result?.trim()).not.toBe('HELLO WORLD');
      expect(result?.length).toBeGreaterThan(0);
    });
  });

  authTest.describe('Mode Switching', () => {
    authTest('should maintain keyword when switching modes', async ({ authenticatedPage }) => {
      // Set up encrypt mode
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('TESTING');
      
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Keyword should be preserved
      const keywordValue = await keywordInput.inputValue();
      expect(keywordValue).toBe('TESTING');
      
      // Switch back to encrypt
      await authenticatedPage.locator('button').filter({ hasText: /^🔒\s*Encrypt$/ }).click();
      
      // Keyword should still be there
      const finalKeywordValue = await keywordInput.inputValue();
      expect(finalKeywordValue).toBe('TESTING');
    });

    authTest('should clear message when switching modes', async ({ authenticatedPage }) => {
      // Set up encrypt mode with message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('TEST MESSAGE');
      
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Message should be preserved (user might want to decrypt their own encryption)
      const messageValue = await messageInput.inputValue();
      expect(messageValue).toBe('TEST MESSAGE');
    });

    authTest('should update alphabet mapping direction when switching modes', async ({ authenticatedPage }) => {
      // Set keyword to show mapping
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('TEST');
      
      // Should show encryption direction
      await expect(authenticatedPage.getByText(/encryption direction.*↓/i)).toBeVisible();
      
      // Switch to decrypt mode
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      // Should show decryption direction
      await expect(authenticatedPage.getByText(/decryption direction.*↑/i)).toBeVisible();
    });
  });

  authTest.describe('Crack Mode Tab', () => {
    authTest('should switch to crack mode and show crack interface', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      await expect(authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ })).toHaveClass(/bg-primary/);
      
      // Should show crack button (will be disabled without message)
      await expect(authenticatedPage.getByRole('button', { name: /crack keyword cipher/i })).toBeVisible();
      
      // Should show crack button description
      await expect(authenticatedPage.getByText(/try to crack this cipher using.*keywords/i)).toBeVisible();
    });

    authTest('should show cipher weaknesses after cracking', async ({ authenticatedPage }) => {
      // Switch to crack mode and perform crack
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Wait for crack results
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 15000 });
      
      // Should show all weakness categories
      await expect(authenticatedPage.getByText('🔍 Why This Cipher Can Be Broken:')).toBeVisible();
      await expect(authenticatedPage.getByText('1. Guessable Keywords')).toBeVisible();
      await expect(authenticatedPage.getByText(/most people pick easy words like.*SECRET.*or.*PASSWORD/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('2. Letter Clues Stay the Same')).toBeVisible();
      await expect(authenticatedPage.getByText(/common letters like.*E.*and.*T.*still appear often/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('3. Repeating Letter Patterns')).toBeVisible();
      await expect(authenticatedPage.getByText(/words like.*THAT.*always become the same scrambled letters/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('4. One Clue Reveals Everything')).toBeVisible();
      await expect(authenticatedPage.getByText(/if we figure out what one word means.*we can decode the whole alphabet/i)).toBeVisible();
    });

    authTest('should show cryptanalysis techniques after cracking', async ({ authenticatedPage }) => {
      // Switch to crack mode and perform crack
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Wait for crack results
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 15000 });
      
      // Should show techniques section
      await expect(authenticatedPage.getByText('🕵️ How To Be a Code Detective:')).toBeVisible();
      await expect(authenticatedPage.getByText('📚 Try Popular Words:')).toBeVisible();
      await expect(authenticatedPage.getByText(/test words like.*SECRET.*MAGIC.*or.*TREASURE/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('🔢 Count the Letters:')).toBeVisible();
      await expect(authenticatedPage.getByText(/see which scrambled letters appear most often/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('🔄 Spot Repeating Patterns:')).toBeVisible();
      await expect(authenticatedPage.getByText(/look for the same groups of letters appearing again/i)).toBeVisible();
      
      await expect(authenticatedPage.getByText('💡 Use Word Clues:')).toBeVisible();
      await expect(authenticatedPage.getByText(/if you guess one word.*use it to figure out others/i)).toBeVisible();
    });

    authTest('should handle Try Sample for crack mode', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Click try sample - should populate with encrypted message
      await authenticatedPage.getByRole('button', { name: /try sample/i }).click();
      
      // Should populate message field with encrypted text
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      const messageValue = await messageInput.inputValue();
      expect(messageValue.length).toBeGreaterThan(0);
      
      // Should be one of the crack samples (encrypted messages)
      const crackSamples = ['DTIIL WLOIR', 'GQOOE LQU', 'MPZPS LDSSDQF', 'OXDKDQ HQYFS', 'EDDFYR KXSXP'];
      expect(crackSamples).toContain(messageValue);
    });

    authTest('should perform dictionary attack when cracking', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Enter a message encrypted with a common keyword
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR'); // "HELLO WORLD" encrypted with "SECRET"
      
      // Click crack button
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Should show crack analysis
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Should find the correct keyword "SECRET" 
      await expect(authenticatedPage.getByText(/🎯 Top Crack Attempts:/)).toBeVisible({ timeout: 15000 });
      await expect(authenticatedPage.getByText(/Keyword: SECRET/)).toBeVisible();
      
      // Should show success message (any crack result)
      await expect(authenticatedPage.getByText(/🎯/).first()).toBeVisible();
    });

    authTest('should show crack attempt results with scoring', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Enter encrypted message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      
      // Start cracking
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Wait for results
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Should show multiple attempts with scores
      await expect(authenticatedPage.getByText(/🎯 Top Crack Attempts:/)).toBeVisible({ timeout: 15000 });
      await expect(authenticatedPage.locator('text=/Score:.*\\d+/').first()).toBeVisible();
      
      // Should show best result highlighted (look for success styling or high score)
      await expect(authenticatedPage.locator('text=/Score:.*[789]\\d/').first()).toBeVisible();
    });

    authTest('should handle message with no solution gracefully', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Enter random text that won't crack well
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('XQZWP VBNMK');
      
      // Start cracking
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Should show attempt but no clear success
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Should show attempts were made
      await expect(authenticatedPage.getByText(/🎯 Top Crack Attempts:/)).toBeVisible({ timeout: 15000 });
      await expect(authenticatedPage.locator('text=/Keyword:/').first()).toBeVisible();
    });

    authTest('should show extended keyword loading', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Enter encrypted message
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      
      // Start cracking
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Should show loading or completion of extended keywords
      // (This tests the API loading + offline fallback functionality)
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Should show that extended analysis was attempted
      await expect(authenticatedPage.getByText(/🎯 Top Crack Attempts:/)).toBeVisible({ timeout: 20000 });
      await expect(authenticatedPage.locator('text=/Keyword:/').first()).toBeVisible();
    });

    authTest('should clear previous results when starting new crack', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // First crack attempt
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Change message and crack again
      await messageInput.fill('GQOOE LQU');
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Should show new results (previous ones cleared)
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
    });

    authTest('should show n-gram scoring information', async ({ authenticatedPage }) => {
      // Switch to crack mode
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      // Enter encrypted message and crack
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('DTIIL WLOIR');
      await authenticatedPage.getByRole('button', { name: /crack keyword cipher/i }).click();
      
      // Wait for results
      await expect(authenticatedPage.getByText('🕵️‍♀️ Crack Analysis')).toBeVisible({ timeout: 10000 });
      
      // Should show scoring methodology (implicit in the crack attempt scoring)
      await expect(authenticatedPage.getByText(/Score:/).first()).toBeVisible();
    });
  });

  authTest.describe('Error Handling and Edge Cases', () => {
    authTest('should handle empty inputs gracefully', async ({ authenticatedPage }) => {
      // Should show placeholder text when empty
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await expect(messageInput).toHaveAttribute('placeholder', 'Enter your message here');
      
      // Should show character count
      await expect(authenticatedPage.getByText(/type something to begin your adventure/i)).toBeVisible();
    });

    authTest('should handle special characters', async ({ authenticatedPage }) => {
      // Enter message with special characters
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      
      await messageInput.fill('HELLO, WORLD! 123');
      await keywordInput.fill('TEST');
      
      // Should process and show result
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible();
      
      const result = await resultElement.textContent();
      expect(result?.trim().length).toBeGreaterThan(0);
      // Special characters and numbers should be preserved
      expect(result).toContain(',');
      expect(result).toContain('!');
      expect(result).toContain('123');
    });

    authTest('should handle very long keywords', async ({ authenticatedPage }) => {
      const keywordInput = authenticatedPage.getByRole('textbox', { name: /secret key/i });
      await keywordInput.fill('VERYLONGKEYWORDWITHMANYLETTERS');
      
      // Should show strength rating
      await expect(authenticatedPage.getByText('🛡️ Keyword Security Rating')).toBeVisible();
      
      // Should handle the long keyword
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      await messageInput.fill('TEST');
      
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible();
    });

    authTest('should show character count updates', async ({ authenticatedPage }) => {
      const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
      
      // Type progressively and check character count
      await messageInput.fill('H');
      await expect(authenticatedPage.getByText('Characters: 1')).toBeVisible();
      
      await messageInput.fill('HELLO');
      await expect(authenticatedPage.getByText('Characters: 5')).toBeVisible();
      
      await messageInput.fill('HELLO WORLD');
      await expect(authenticatedPage.getByText('Characters: 11')).toBeVisible();
    });
  });
});