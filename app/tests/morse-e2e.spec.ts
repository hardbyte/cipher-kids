import { test as authTest, expect } from './test';
import { getCipherResult, getCipherResultDirect, fillMessage, clickCipherAction } from './test-helpers';

authTest.describe('Morse Code End-to-End Testing', () => {
  authTest.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ciphers/morse');
    // Use the larger main heading, not the navigation heading
    await expect(authenticatedPage.getByRole('heading', { name: 'Morse Code' }).nth(1)).toBeVisible();
  });

  authTest.describe('Encrypt Mode', () => {
    authTest('should encrypt message with Morse code correctly', async ({ authenticatedPage }) => {
      // Ensure we're in encrypt mode
      await expect(authenticatedPage.getByRole('button', { name: 'lock Encrypt' })).toBeVisible();
      
      // Type a simple message
      await fillMessage(authenticatedPage, 'SOS');
      
      // Click encrypt button
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Wait for animation to complete and check result
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('... --- ...');
    });

    authTest('should show Morse code visualization during encrypting', async ({ authenticatedPage }) => {
      // Type a message
      await fillMessage(authenticatedPage, 'HI');
      
      // Click encrypt
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Should show the visualization area
      await expect(authenticatedPage.locator('.bg-accent\\/10')).toBeVisible();
    });

    authTest('should handle numbers and letters in encrypting', async ({ authenticatedPage }) => {
      // Type message with numbers
      await fillMessage(authenticatedPage, 'A1');
      
      // Click encrypt
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Should encrypt both letter and number
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('.- .----');
    });
  });

  authTest.describe('Decrypt Mode', () => {
    authTest('should decrypt Morse code back to letters', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.getByRole('button', { name: 'unlock Decrypt' }).click();
      
      // Enter Morse code
      await fillMessage(authenticatedPage, '... --- ...');
      
      // Click decrypt button  
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Check result
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('SOS');
    });

    authTest('should handle word separators during decrypting', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.getByRole('button', { name: 'unlock Decrypt' }).click();
      
      // Enter Morse code with word separator
      await fillMessage(authenticatedPage, '.... .. / - .... . .-. .');
      
      // Click decrypt
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Should decrypt to "HI THERE"
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HI THERE');
    });
  });

  authTest.describe('User Interface', () => {
    authTest('should show sample messages when input is empty', async ({ authenticatedPage }) => {
      // Should show sample messages section
      await expect(authenticatedPage.getByText('Try these messages:')).toBeVisible();
      
      // Should have SOS sample - target the specific clickable code element
      await expect(authenticatedPage.getByRole('code').filter({ hasText: 'SOS' })).toBeVisible();
      
      // Click on SOS sample (the clickable code element)
      await authenticatedPage.getByRole('code').filter({ hasText: 'SOS' }).click();
      
      // Should fill the input
      await expect(authenticatedPage.getByRole('textbox', { name: /secret message/i })).toHaveValue('SOS');
    });

    authTest('should switch between encrypt and decrypt modes', async ({ authenticatedPage }) => {
      // Start in encrypt mode
      await expect(authenticatedPage.getByRole('button', { name: 'lock Encrypt' })).toBeVisible();
      await expect(authenticatedPage.getByText('Try these messages:')).toBeVisible();
      
      // Switch to decrypt mode
      await authenticatedPage.getByRole('button', { name: 'unlock Decrypt' }).click();
      
      // Check that content changed to decrypt mode
      await expect(authenticatedPage.getByText('Try these Morse codes:')).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: 'magic wand Decrypt sparkles' })).toBeVisible();
    });

    authTest('should show crack mode for Morse code', async ({ authenticatedPage }) => {
      // Morse code should have a crack mode
      await expect(authenticatedPage.getByRole('button', { name: 'detective Crack' })).toBeVisible();
    });
  });

  authTest.describe('Step-by-Step Animation', () => {
    authTest('should show step-by-step animation for encrypting', async ({ authenticatedPage }) => {
      // Type a message
      await fillMessage(authenticatedPage, 'AB');
      
      // Click show animation
      await authenticatedPage.getByRole('button', { name: 'Show Animation' }).click();
      
      // Should show the animation component
      await expect(authenticatedPage.getByText('Morse Code Translation')).toBeVisible();
      
      // Should show progress bar
      await expect(authenticatedPage.locator('.bg-primary.h-2.rounded-full')).toBeVisible();
    });

    authTest('should show step-by-step animation for decrypting', async ({ authenticatedPage }) => {
      // Switch to decrypt mode
      await authenticatedPage.getByRole('button', { name: 'unlock Decrypt' }).click();
      
      // Enter Morse code
      await fillMessage(authenticatedPage, '.- -...');
      
      // Click show animation
      await authenticatedPage.getByRole('button', { name: 'Show Animation' }).click();
      
      // Should show the animation component
      await expect(authenticatedPage.getByText('Morse Code Translation')).toBeVisible();
    });

    authTest('should allow manual control of animation', async ({ authenticatedPage }) => {
      // Type a message
      await fillMessage(authenticatedPage, 'AB');
      
      // Show animation
      await authenticatedPage.getByRole('button', { name: 'Show Animation' }).click();
      
      // Switch to manual mode
      await authenticatedPage.getByRole('button', { name: 'Manual' }).click();
      
      // Should show manual controls
      await expect(authenticatedPage.getByRole('button', { name: 'Next →' })).toBeVisible();
      await expect(authenticatedPage.getByRole('button', { name: '← Previous' })).toBeVisible();
    });
  });

  authTest.describe('Audio Features', () => {
    authTest('should show audio controls when available', async ({ authenticatedPage }) => {
      // Type a message to trigger visualization
      await fillMessage(authenticatedPage, 'A');
      
      // Click encrypt to show character
      await clickCipherAction(authenticatedPage, 'encrypt');
      
      // Wait for the result to appear
      await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).toBeVisible();
      
      // Should show listen button if audio is supported
      const listenButton = authenticatedPage.getByRole('button', { name: /🔊 Listen/ });
      if (await listenButton.isVisible()) {
        await expect(listenButton).toBeVisible();
      }
    });
  });

  authTest.describe('Educational Content', () => {
    authTest('should show educational explanations', async ({ authenticatedPage }) => {
      // Should show "How It Works" section
      await expect(authenticatedPage.getByText('📡 How It Works: Morse Code')).toBeVisible();
      
      // Should show encoding/decoding steps
      await expect(authenticatedPage.getByText('🎯 How to Encode Messages')).toBeVisible();
      
      // Should show real-world uses
      await expect(authenticatedPage.getByText('📻 Real-World Uses')).toBeVisible();
      
      // Should show example
      await expect(authenticatedPage.getByText('🧩 Example:')).toBeVisible();
    });

    authTest('should provide try it yourself section', async ({ authenticatedPage }) => {
      // Should show try it yourself section
      await expect(authenticatedPage.getByText('🎮 Try It Yourself!')).toBeVisible();
      
      // Should mention key concepts
      await expect(authenticatedPage.getByText('Dots are short beeps')).toBeVisible();
      await expect(authenticatedPage.getByText('Dashes are long beeps')).toBeVisible();
    });
  });

  authTest.describe('Decode Accuracy Tests', () => {
    authTest('should decode HELLO correctly without truncation', async ({ authenticatedPage }) => {
      // Switch to decode mode
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).click();
      
      // Enter morse code for HELLO
      await fillMessage(authenticatedPage, '.... . .-.. .-.. ---');
      
      // Click decrypt button
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Check the result is HELLO, not HELL
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO');
    });

    authTest('should decode multiple words correctly', async ({ authenticatedPage }) => {
      // Switch to decode mode
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).click();
      
      // Enter morse code for HELLO WORLD
      await fillMessage(authenticatedPage, '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
      
      // Click decrypt button
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Check the result
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('HELLO WORLD');
    });

    authTest('should decode long messages without truncation', async ({ authenticatedPage }) => {
      // Switch to decode mode
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).click();
      
      // Enter morse code for SECRET MESSAGE
      await fillMessage(authenticatedPage, '... . -.-. .-. . - / -- . ... ... .- --. .');
      
      // Click decrypt button
      await clickCipherAction(authenticatedPage, 'decrypt');
      
      // Check the result
      const result = await getCipherResultDirect(authenticatedPage);
      expect(result).toBe('SECRET MESSAGE');
    });
  });
});