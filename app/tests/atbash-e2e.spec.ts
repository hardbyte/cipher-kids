import { getCipherResultDirect, fillMessage, clickCipherAction } from './test-helpers';
import { test as authTest } from './fixtures/auth';
import { expect } from '@playwright/test';

authTest.describe('Atbash Cipher End-to-End Testing', () => {
  authTest.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ciphers/atbash');
    await expect(authenticatedPage.getByRole('heading', { name: 'Atbash Cipher' }).nth(1)).toBeVisible({ timeout: 10000 });
  });

  authTest.describe('Encrypt Mode', () => {
    authTest('should encrypt a message correctly', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'HELLO WORLD');
      await clickCipherAction(authenticatedPage, 'encrypt');
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('SVOOL DLIOW');
    });

    authTest('should preserve special characters and numbers', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'HELLO, WORLD! 123');
      await clickCipherAction(authenticatedPage, 'encrypt');
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('SVOOL, DLIOW! 123');
    });

    authTest('should handle mixed case input', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'Hello World');
      await clickCipherAction(authenticatedPage, 'encrypt');
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('SVOOL DLIOW');
    });
  });

  authTest.describe('Decrypt Mode', () => {
    authTest('should decrypt a message correctly', async ({ authenticatedPage }) => {
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).first().click();
      await fillMessage(authenticatedPage, 'SVOOL DLIOW');
      await clickCipherAction(authenticatedPage, 'decrypt');
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO WORLD');
    });

    authTest('should encrypt and then decrypt a message', async ({ authenticatedPage }) => {
      const originalMessage = 'HELLO';
      
      // Encrypt
      await fillMessage(authenticatedPage, originalMessage);
      await clickCipherAction(authenticatedPage, 'encrypt');
      const encrypted = await getCipherResultDirect(authenticatedPage);
      expect(encrypted).toBe('SVOOL');

      // Switch to decrypt and decrypt the encrypted message
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).first().click();
      // Ensure the mode switch has completed
      await expect(authenticatedPage.getByRole('button', { name: /decrypt/i }).first()).toHaveClass(/bg-primary/);
      await fillMessage(authenticatedPage, encrypted);
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      const cleanResult = await getCipherResultDirect(authenticatedPage);
      expect(cleanResult).toBe(originalMessage);
    });

    authTest('should decrypt and then encrypt a message', async ({ authenticatedPage }) => {
      const originalMessage = 'SVOOL';
      
      // Decrypt
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).first().click();
      await expect(authenticatedPage.getByRole('button', { name: /decrypt/i }).first()).toHaveClass(/bg-primary/);
      
      await fillMessage(authenticatedPage, originalMessage);
      await clickCipherAction(authenticatedPage, 'decrypt');
      const decrypted = await getCipherResultDirect(authenticatedPage);
      expect(decrypted).toBe('HELLO');

      // Switch to encrypt and encrypt the decrypted message
      await authenticatedPage.getByRole('button', { name: /encrypt/i }).first().click();
      await expect(authenticatedPage.getByRole('button', { name: /encrypt/i }).first()).toHaveClass(/bg-primary/);
      
      await fillMessage(authenticatedPage, decrypted);
      await clickCipherAction(authenticatedPage, 'encrypt');
      const encrypted = await getCipherResultDirect(authenticatedPage);
      expect(encrypted).toBe(originalMessage);
    });
  });

  authTest.describe('Crack Mode', () => {
    authTest('should crack the cipher successfully', async ({ authenticatedPage }) => {
      await authenticatedPage.getByRole('button', { name: /crack/i }).click();
      await fillMessage(authenticatedPage, 'SVOOL DLIOW');
      await authenticatedPage.getByRole('button', { name: /crack the code/i }).click();
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO WORLD');
    });
  });

  authTest.describe('UI and Educational Content', () => {
    authTest('should show alphabet mapping visualization', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('🪞 Mirror Alphabet')).toBeVisible();
      const mappingContainer = authenticatedPage.getByTestId('animated-mapping');
      await expect(mappingContainer.getByText('A', { exact: true }).first()).toBeVisible();
      await expect(mappingContainer.getByText('Z', { exact: true }).first()).toBeVisible();
    });

    authTest('should show educational content', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('📚 About Atbash')).toBeVisible();
      await expect(authenticatedPage.getByText('No Key Needed!')).toBeVisible();
    });

    authTest('should show step-by-step animation when requested', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'CAT');
      const showStepsButton = authenticatedPage.getByRole('button', { name: /show.*steps/i });
      await showStepsButton.scrollIntoViewIfNeeded();
      await showStepsButton.click({ force: true });
      await expect(authenticatedPage.getByText('🔍 Atbash Step-by-Step')).toBeVisible();
    });
  });
});
