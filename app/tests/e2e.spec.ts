import { test, expect } from '@playwright/test';
import { 
  navigateToCipherWithUser, 
  fillMessage, 
  clickCipherAction, 
  getCipherResult, 
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
    expected: 'JDMMS'
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
    test('loads correctly and shows proper elements', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/caesar');
      
      // Verify page loaded correctly
      await expect(page).toHaveTitle(/Kids Code Club/);
      await expect(page.getByRole('heading', { name: 'Caesar Cipher' })).toBeVisible();
      
      // Verify essential elements are present
      await expect(page.getByRole('textbox', { name: /secret message/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /encrypt/i })).toBeVisible();
      await expect(page.getByRole('slider', { name: /shift/i })).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/caesar');
      
      // Set up test case
      await fillMessage(page, TEST_CASES.caesar.message);
      await setSliderValue(page, 'shift', TEST_CASES.caesar.shift);
      
      // Perform encryption
      await clickCipherAction(page, 'encrypt');
      
      // Verify result
      const result = await getCipherResult(page);
      expect(result).toBe(TEST_CASES.caesar.expected);
    });
    
    test('decrypt reverses encryption', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/caesar');
      
      // First encrypt
      await fillMessage(page, TEST_CASES.caesar.message);
      await setSliderValue(page, 'shift', TEST_CASES.caesar.shift);
      await clickCipherAction(page, 'encrypt');
      const encrypted = await getCipherResult(page);
      
      // Switch to decrypt mode
      const decryptButton = page.getByRole('button', { name: /decrypt/i }).first();
      await decryptButton.click();
      
      // Decrypt the result
      await fillMessage(page, encrypted);
      await clickCipherAction(page, 'decrypt');
      
      // Should get back original message
      const decrypted = await getCipherResult(page);
      expect(decrypted.replace(/\s/g, '')).toBe(TEST_CASES.caesar.message.replace(/\s/g, ''));
    });
  });
  
  test.describe('Keyword Cipher', () => {
    test('loads correctly and shows proper elements', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/keyword');
      
      await expect(page).toHaveTitle(/Kids Code Club/);
      await expect(page.getByRole('heading', { name: 'Keyword Cipher' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /secret message/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /secret key/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /encrypt/i })).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/keyword');
      
      await fillMessage(page, TEST_CASES.keyword.message);
      await fillKeyword(page, TEST_CASES.keyword.keyword);
      await clickCipherAction(page, 'encrypt');
      
      const result = await getCipherResult(page);
      expect(result).toBe(TEST_CASES.keyword.expected);
    });
  });
  
  test.describe('Atbash Cipher', () => {
    test('loads correctly and encrypts message', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/atbash');
      
      await expect(page.getByRole('heading', { name: 'Atbash Cipher' })).toBeVisible();
      
      await fillMessage(page, TEST_CASES.atbash.message);
      await clickCipherAction(page, 'encrypt');
      
      const result = await getCipherResult(page);
      expect(result).toBe(TEST_CASES.atbash.expected);
    });
  });
  
  test.describe('Rail Fence Cipher', () => {
    test('loads correctly and shows visualization', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/railfence');
      
      await expect(page.getByRole('heading', { name: 'Rail Fence Cipher' })).toBeVisible();
      
      // Fill message to see visualization
      await fillMessage(page, TEST_CASES.railfence.message);
      
      // Check that visualization appears
      await expect(page.getByText('Zigzag Pattern')).toBeVisible();
    });
    
    test('encrypts message correctly', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/railfence');
      
      await fillMessage(page, TEST_CASES.railfence.message);
      await setSliderValue(page, 'rails', TEST_CASES.railfence.rails);
      await clickCipherAction(page, 'encrypt');
      
      const result = await getCipherResult(page);
      expect(result).toBe(TEST_CASES.railfence.expected);
    });
  });
  
  test.describe('Vigenère Cipher', () => {
    test('loads correctly and encrypts message', async ({ page }) => {
      await navigateToCipherWithUser(page, '/ciphers/vigenere');
      
      await expect(page.getByRole('heading', { name: 'Vigenère Cipher' }).first()).toBeVisible();
      
      await fillMessage(page, TEST_CASES.vigenere.message);
      await fillKeyword(page, TEST_CASES.vigenere.keyword);
      await clickCipherAction(page, 'encrypt');
      
      const result = await getCipherResult(page);
      expect(result).toBe(TEST_CASES.vigenere.expected);
    });
  });
});

test.describe('User Interface', () => {
  test('theme switching works', async ({ page }) => {
    await navigateToCipherWithUser(page, '/ciphers/caesar');
    
    const themeButton = page.getByRole('button', { name: /switch theme/i });
    await expect(themeButton).toBeVisible();
    
    // Click theme switcher
    await themeButton.click();
    await page.waitForTimeout(500);
    
    // Verify theme switched (page should still be functional)
    await expect(page.getByRole('heading', { name: 'Caesar Cipher' })).toBeVisible();
  });
  
  test('navigation between ciphers works', async ({ page }) => {
    await navigateToCipherWithUser(page, '/');
    
    // Navigate to different ciphers using navigation links
    const caesarLink = page.getByRole('link', { name: /caesar/i });
    await caesarLink.click();
    await expect(page.getByRole('heading', { name: 'Caesar Cipher' })).toBeVisible();
    
    const keywordLink = page.getByRole('link', { name: /keyword/i });
    await keywordLink.click();
    await expect(page.getByRole('heading', { name: 'Keyword Cipher' })).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('handles empty message gracefully', async ({ page }) => {
    await navigateToCipherWithUser(page, '/ciphers/caesar');
    
    // Try to encrypt empty message
    await fillMessage(page, '');
    await clickCipherAction(page, 'encrypt');
    
    // Should not crash - page should still be functional
    await expect(page.getByRole('heading', { name: 'Caesar Cipher' })).toBeVisible();
  });
  
  test('handles special characters in message', async ({ page }) => {
    await navigateToCipherWithUser(page, '/ciphers/caesar');
    
    await fillMessage(page, 'HELLO! 123 @#$');
    await clickCipherAction(page, 'encrypt');
    
    // Should process without crashing
    await expect(page.getByRole('heading', { name: 'Caesar Cipher' })).toBeVisible();
  });
});