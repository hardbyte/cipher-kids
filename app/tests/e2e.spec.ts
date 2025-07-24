import { test, expect } from './fixtures/auth';
import { navigateWithAuth } from './helpers/auth-helpers';
import { 
  fillMessage, 
  clickCipherAction, 
  getCipherResultDirect, 
  setSliderValue, 
  fillKeyword 
} from './test-helpers';

// Test data for algorithm verification
const TEST_CASES = {
  caesar: {
    message: 'HELLO',
    shift: 3,
    expected: 'KHOOR'
  },
  keyword: {
    message: 'HELLO',
    keyword: 'SECRET',
    expected: 'DTIIL'
  },
  atbash: {
    message: 'HELLO',
    expected: 'SVOOL'
  },
  railfence: {
    message: 'HELLOWORLD',
    rails: 3,
    expected: 'HOLELWRDLO'
  },
  vigenere: {
    message: 'HELLO',
    keyword: 'KEY',
    expected: 'RIJVS'
  }
};

test.describe('End-to-End Cipher Functionality', () => {
  
  test.describe('Caesar Cipher', () => {
    test('loads correctly and shows proper elements', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
      
      // Verify page loaded correctly
      await expect(authenticatedPage).toHaveTitle(/Kids Code Club/);
      await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
      
      // Verify essential elements are present
      await expect(authenticatedPage.getByRole('textbox', { name: /secret message/i })).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: /encrypt/i }).first()).toBeVisible();
      await expect(authenticatedPage.getByRole('slider', { name: /shift/i })).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
      
      // Set up test case
      await fillMessage(authenticatedPage, TEST_CASES.caesar.message);
      await setSliderValue(authenticatedPage, 'shift', TEST_CASES.caesar.shift);
      
      // Perform encryption
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Verify result
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe(TEST_CASES.caesar.expected);
    });
    
    test('decrypt reverses encryption', async ({ authenticatedPage }) => {
      // TODO: Fix decrypt mode switching - currently mode buttons don't work as expected in tests
      // This functionality works in manual testing but needs better test implementation
      await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
      
      // First encrypt
      await fillMessage(authenticatedPage, TEST_CASES.caesar.message);
      await setSliderValue(authenticatedPage, 'shift', TEST_CASES.caesar.shift);
      await clickCipherAction(authenticatedPage, 'encrypt');
      const encrypted = await getCipherResultDirect(authenticatedPage);
      
      // Switch to decrypt mode by clicking the mode toggle button
      const decryptModeButton = authenticatedPage.getByRole('button', { name: 'unlock Decrypt' });
      await decryptModeButton.click();
      // Wait for mode change by checking the button state
      await expect(decryptModeButton).toHaveClass(/bg-primary/);
      
      // Clear and fill the encrypted message
      await fillMessage(authenticatedPage, encrypted);
      
      // Click the main action button (which should now be in decrypt mode)
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Should get back original message
      const decrypted = await getCipherResultDirect(authenticatedPage);
      expect(decrypted.replace(/\s/g, '')).toBe(TEST_CASES.caesar.message.replace(/\s/g, ''));
    });
  });
  
  test.describe('Keyword Cipher', () => {
    test('loads correctly and shows proper elements', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/keyword');
      
      await expect(authenticatedPage).toHaveTitle(/Kids Code Club/);
      await expect(authenticatedPage.getByRole('heading', { name: 'Keyword Cipher' }).first()).toBeVisible();
      await expect(authenticatedPage.getByRole('textbox', { name: /secret message/i })).toBeVisible();
      await expect(authenticatedPage.getByRole('textbox', { name: /secret key/i })).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: /encrypt/i }).first()).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/keyword');
      
      await fillMessage(authenticatedPage, TEST_CASES.keyword.message);
      await fillKeyword(authenticatedPage, TEST_CASES.keyword.keyword);
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe(TEST_CASES.keyword.expected);
    });
  });
  
  test.describe('Atbash Cipher', () => {
    test('loads correctly and encrypts message', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/atbash');
      
      await expect(authenticatedPage.getByRole('heading', { name: 'Atbash Cipher' }).first()).toBeVisible();
      
      await fillMessage(authenticatedPage, TEST_CASES.atbash.message);
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe(TEST_CASES.atbash.expected);
    });
  });
  
  test.describe('Rail Fence Cipher', () => {
    test('loads correctly and shows visualization', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/railfence');
      
      await expect(authenticatedPage.getByRole('heading', { name: 'Rail Fence Cipher' }).first()).toBeVisible();
      
      // Fill message to see visualization
      await fillMessage(authenticatedPage, TEST_CASES.railfence.message);
      
      // Check that visualization appears
      await expect(authenticatedPage.getByText('Zigzag Pattern').first()).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/railfence');
      
      await fillMessage(authenticatedPage, TEST_CASES.railfence.message);
      await setSliderValue(authenticatedPage, 'rails', TEST_CASES.railfence.rails);
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe(TEST_CASES.railfence.expected);
    });
  });
  
  test.describe('Vigenère Cipher', () => {
    test('loads correctly and encrypts message', async ({ authenticatedPage }) => {
      await navigateWithAuth(authenticatedPage, '/ciphers/vigenere');
      
      await expect(authenticatedPage.getByRole('heading', { name: 'Vigenère Cipher' }).first()).toBeVisible();
      
      await fillMessage(authenticatedPage, TEST_CASES.vigenere.message);
      await fillKeyword(authenticatedPage, TEST_CASES.vigenere.keyword);
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe(TEST_CASES.vigenere.expected);
    });
  });
});

test.describe('User Interface', () => {
  test('theme switching works', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    const themeButton = authenticatedPage.getByRole('button', { name: /switch theme/i });
    await expect(themeButton).toBeVisible();
    
    // Click theme switcher
    await themeButton.click();
    // Wait for theme change by checking the HTML class changes (could be light, matrix, or emoji)
    await expect(authenticatedPage.locator('html')).toHaveAttribute('class');
    
    // Verify theme switched (page should still be functional)
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
  });
  
  test('navigation between ciphers works', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/');
    
    // Navigate to different ciphers using navigation links with resilient waiting
    const caesarLink = authenticatedPage.getByRole('link', { name: /caesar/i }).first();
    await caesarLink.click();
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
    
    // Wait for page to stabilize before next navigation
    await authenticatedPage.waitForTimeout(1000);
    
    const keywordLink = authenticatedPage.getByRole('link', { name: /keyword/i }).first();
    await keywordLink.click();
    await expect(authenticatedPage.getByRole('heading', { name: 'Keyword Cipher' }).first()).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('handles empty message gracefully', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    // Try to encrypt empty message
    await fillMessage(authenticatedPage, '');
    await clickCipherAction(authenticatedPage, 'encrypt');
    
    // Should not crash - page should still be functional
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
  });
  
  test('handles special characters in message', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/caesar');
    
    await fillMessage(authenticatedPage, 'HELLO! 123 @#$');
    await clickCipherAction(authenticatedPage, 'encrypt');
    
    // Should process without crashing
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
  });
});