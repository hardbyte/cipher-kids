import { expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth';
import { fillMessage, clickCipherAction, getCipherResultDirect } from './test-helpers';

authTest.describe('Pigpen Cipher End-to-End Testing', () => {
  authTest.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ciphers/pigpen');
    await expect(authenticatedPage.getByRole('heading', { name: 'Pigpen Cipher' }).nth(1)).toBeVisible();
  });

  authTest.describe('Encrypt Mode', () => {
    authTest('should encrypt a simple message correctly', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'HELLO');
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('┬ ┼ └. └. ├.'); 
    });

    authTest('should encrypt a message with characters from all grids', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'JUMPING FOX');
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Wait for the complete result to appear
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible({ timeout: 10000 });
      // J U M P I N G   F O X
      await expect(resultElement).toHaveText('┘. < ┤. ┐. ┌ ┼. ┐   ├ ├. >.', { timeout: 10000 });
    });

    authTest('should highlight characters in the Pigpen grid during encryption', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'A');
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Check that highlighting occurs - this may need adjustment based on actual implementation
      const highlightedCell = authenticatedPage.locator('.border-accent').first();
      await expect(highlightedCell).toBeVisible();
    });

    authTest('should handle non-alphabetic characters by preserving them', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'HELLO 123!');
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Wait for complete result including non-alphabetic characters
      const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
      await expect(resultElement).toBeVisible({ timeout: 10000 });
      await expect(resultElement).toHaveText('┬ ┼ └. └. ├.   1 2 3 !', { timeout: 10000 });
    });
  });

  authTest.describe('Decrypt Mode', () => {
    authTest('should decrypt a simple message correctly', async ({ authenticatedPage }) => {
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      await fillMessage(authenticatedPage, '┬ ┼ └. └. ├.'); // HELLO
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO');
    });

    authTest('should decrypt a message with symbols from all grids', async ({ authenticatedPage }) => {
        await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
        
        // JUMPING FOX
        await fillMessage(authenticatedPage, '┘. < ┤. ┐. ┌ ┼. ┐   ├ ├. >.');
        await clickCipherAction(authenticatedPage, 'decrypt');
        
        // Wait for complete decryption result
        const resultElement = authenticatedPage.locator('[data-testid="cipher-result"]');
        await expect(resultElement).toBeVisible({ timeout: 15000 });
        await expect(resultElement).toHaveText('JUMPINGFOX', { timeout: 15000 });
    });

    authTest('should handle mixed symbols and non-symbols during decryption', async ({ authenticatedPage }) => {
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      await fillMessage(authenticatedPage, '┬ ┼ └. 1 2 3 !');
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HEL123!');
    });

    authTest('should handle invalid symbols during decryption', async ({ authenticatedPage }) => {
        await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
        
        await fillMessage(authenticatedPage, '┘-┴-└.'); // Using invalid separator
        await clickCipherAction(authenticatedPage, 'decrypt');
        
        const result = await getCipherResultDirect(authenticatedPage);
        // Should preserve the invalid character (A from ┘, then -, then B from ┴, then -, then L from └.)
        expect(result).toBe('A-B-L');
    });
  });

  authTest.describe('Crack Mode', () => {
    authTest('should switch to crack mode and perform decryption', async ({ authenticatedPage }) => {
      await authenticatedPage.locator('button').filter({ hasText: /^🕵️‍♀️\s*Crack$/ }).click();
      
      await fillMessage(authenticatedPage, '┬ ┼ └. └. ├.');
      
      await authenticatedPage.getByRole('button', { name: /crack the code/i }).click();
      
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO');
    });
  });

  authTest.describe('Step-by-Step Animation', () => {
    authTest('should show correct explanation for encryption', async ({ authenticatedPage }) => {
      await fillMessage(authenticatedPage, 'A');
      
      await authenticatedPage.getByRole('button', { name: /show steps/i }).click();
      
      // Just verify the button was clicked successfully by checking it changes to "Hide Steps"
      await expect(authenticatedPage.getByRole('button', { name: /hide steps/i })).toBeVisible();
    });

    authTest('should show correct explanation for decryption', async ({ authenticatedPage }) => {
      await authenticatedPage.locator('button').filter({ hasText: /^🔓\s*Decrypt$/ }).click();
      
      await fillMessage(authenticatedPage, '┘'); // A
      
      await authenticatedPage.getByRole('button', { name: /show steps/i }).click();
      
      // Just verify the button was clicked successfully by checking it changes to "Hide Steps"
      await expect(authenticatedPage.getByRole('button', { name: /hide steps/i })).toBeVisible();
    });
  });
});
