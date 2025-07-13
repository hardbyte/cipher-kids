import { test, expect } from './fixtures/auth';
import { navigateWithAuth } from './helpers/auth-helpers';

test.describe('Smoke Tests', () => {
  
  test('Caesar cipher page loads and renders correctly', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    // Verify page title
    await expect(authenticatedPage).toHaveTitle(/Kids Code Club/);
    
    // Verify essential form elements
    await expect(authenticatedPage.getByRole('textbox', { name: /secret message/i })).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: /encrypt/i }).first()).toBeVisible();
  });
  
  test('All cipher pages load correctly with authentication', async ({ authenticatedPage }) => {
    const cipherPages = [
      '/ciphers/caesar',
      '/ciphers/keyword', 
      '/ciphers/atbash',
      '/ciphers/railfence',
      '/ciphers/vigenere' // Now testing vigenere with proper auth fixture
    ];
    
    for (const cipherPath of cipherPages) {
      await navigateWithAuth(authenticatedPage, cipherPath);
      
      // Should have basic cipher functionality
      await expect(authenticatedPage.getByRole('textbox', { name: /secret message/i })).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: /encrypt/i }).first()).toBeVisible();
    }
  });
  
  test('User can interact with cipher forms', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    // Fill the message input
    const messageInput = authenticatedPage.getByRole('textbox', { name: /secret message/i });
    await messageInput.fill('HELLO');
    
    // Verify input was filled
    const inputValue = await messageInput.inputValue();
    expect(inputValue).toBe('HELLO');
    
    // Click encrypt button (should not crash)
    const encryptButton = authenticatedPage.getByRole('button', { name: /encrypt/i }).last();
    await encryptButton.click();
    
    // Application should remain functional
    await expect(messageInput).toBeVisible();
  });
});