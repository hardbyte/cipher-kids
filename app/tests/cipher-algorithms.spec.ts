import { test, expect } from './fixtures/auth';
import { navigateWithAuth } from './helpers/auth-helpers';
import { 
  fillMessage, 
  clickCipherAction, 
  getCipherResultDirect, 
} from './test-helpers';

test.describe('Cipher Algorithm Correctness - Focused Debug', () => {
  
  test('Atbash cipher: decrypt reverses encryption', async ({ authenticatedPage }) => {
    await navigateWithAuth(authenticatedPage, '/ciphers/atbash');
    
    const originalMessage = 'HELLO';
    
    // Encrypt
    await fillMessage(authenticatedPage, originalMessage);
    await clickCipherAction(authenticatedPage, 'encrypt');
    const encrypted = await getCipherResultDirect(authenticatedPage);
    expect(encrypted).toBe('SVOOL');

    // Switch to decrypt mode
    await authenticatedPage.getByRole('button', { name: /decrypt/i }).first().click();
    
    // Decrypt the encrypted message
    await fillMessage(authenticatedPage, encrypted);
    await clickCipherAction(authenticatedPage, 'decrypt');
    const decrypted = await getCipherResultDirect(authenticatedPage);
    
    expect(decrypted).toBe(originalMessage);
  });

});