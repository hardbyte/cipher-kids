import { test as authTest, expect } from './fixtures/auth';

/**
 * Visual regression tests for all cipher pages
 * These tests capture screenshots of each cipher page in different states
 * to automatically detect visual changes and regressions.
 */

// Helper function to wait for page to be fully loaded and stable
async function waitForPageStable(page: any) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for any animations to complete
  await page.waitForTimeout(1000);
  
  // Ensure fonts are loaded
  await page.waitForFunction(() => document.fonts.ready);
}

// Helper function to fill cipher input consistently
async function fillCipherInput(page: any, message: string) {
  const messageInput = page.getByPlaceholder(/enter.*message|type.*message/i).first();
  await messageInput.fill(message);
  await page.waitForTimeout(500); // Allow for real-time updates
}

// Helper function to set cipher parameters
async function setCipherParam(page: any, value: string) {
  const paramInput = page.locator('input[type="text"]').nth(1); // Usually the second input
  await paramInput.fill(value);
  await page.waitForTimeout(500);
}

authTest.describe('Visual Tests - Cipher Pages', () => {
  
  authTest.describe('Caesar Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('caesar-initial.png');
    });

    authTest('should match baseline - encrypt mode with content', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForPageStable(authenticatedPage);
      
      // Fill message and set shift
      await fillCipherInput(authenticatedPage, 'HELLO WORLD');
      
      // Set shift value using slider
      const slider = authenticatedPage.locator('[role="slider"]');
      await slider.fill('3');
      await authenticatedPage.waitForTimeout(500);
      
      await expect(authenticatedPage).toHaveScreenshot('caesar-encrypt-filled.png');
    });

    authTest('should match baseline - decrypt mode', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForPageStable(authenticatedPage);
      
      // Switch to decrypt mode
      await authenticatedPage.getByRole('button', { name: /decrypt/i }).click();
      await fillCipherInput(authenticatedPage, 'KHOOR ZRUOG');
      
      await expect(authenticatedPage).toHaveScreenshot('caesar-decrypt-mode.png');
    });

    authTest('should match baseline - crack mode', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForPageStable(authenticatedPage);
      
      // Switch to crack mode
      await authenticatedPage.getByRole('button', { name: /crack/i }).click();
      await fillCipherInput(authenticatedPage, 'KHOOR ZRUOG');
      
      await expect(authenticatedPage).toHaveScreenshot('caesar-crack-mode.png');
    });
  });

  authTest.describe('Atbash Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/atbash');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('atbash-initial.png');
    });

    authTest('should match baseline - with content and mapping', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/atbash');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'HELLO WORLD');
      
      await expect(authenticatedPage).toHaveScreenshot('atbash-with-content.png');
    });
  });

  authTest.describe('Keyword Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('keyword-initial.png');
    });

    authTest('should match baseline - with keyword and strength meter', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'SECRET MESSAGE');
      await setCipherParam(authenticatedPage, 'CIPHER');
      
      await expect(authenticatedPage).toHaveScreenshot('keyword-with-strength.png');
    });

    authTest('should match baseline - crack mode with API status', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForPageStable(authenticatedPage);
      
      // Switch to crack mode
      await authenticatedPage.getByRole('button', { name: /crack/i }).click();
      await fillCipherInput(authenticatedPage, 'FRPERG ZRFFNTR');
      
      // Wait for API status to load
      await authenticatedPage.waitForTimeout(2000);
      
      await expect(authenticatedPage).toHaveScreenshot('keyword-crack-mode.png');
    });
  });

  authTest.describe('Vigenère Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/vigenere');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('vigenere-initial.png');
    });

    authTest('should match baseline - with keyword and analysis', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/vigenere');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'HELLO WORLD');
      await setCipherParam(authenticatedPage, 'KEY');
      
      await expect(authenticatedPage).toHaveScreenshot('vigenere-with-analysis.png');
    });
  });

  authTest.describe('Morse Code Visual Tests', () => {
    authTest('should match baseline - encode mode', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/morse');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'SOS');
      
      await expect(authenticatedPage).toHaveScreenshot('morse-encode.png');
    });

    authTest('should match baseline - decode mode', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/morse');
      await waitForPageStable(authenticatedPage);
      
      // Switch to decode mode
      await authenticatedPage.getByRole('button', { name: /decode/i }).click();
      await fillCipherInput(authenticatedPage, '... --- ...');
      
      await expect(authenticatedPage).toHaveScreenshot('morse-decode.png');
    });
  });

  authTest.describe('Pigpen Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/pigpen');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('pigpen-initial.png');
    });

    authTest('should match baseline - with symbols', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/pigpen');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'HELLO');
      
      await expect(authenticatedPage).toHaveScreenshot('pigpen-with-symbols.png');
    });
  });

  authTest.describe('Rail Fence Cipher Visual Tests', () => {
    authTest('should match baseline - initial state', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/railfence');
      await waitForPageStable(authenticatedPage);
      
      await expect(authenticatedPage).toHaveScreenshot('railfence-initial.png');
    });

    authTest('should match baseline - with zigzag visualization', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/railfence');
      await waitForPageStable(authenticatedPage);
      
      await fillCipherInput(authenticatedPage, 'HELLO WORLD');
      
      // Set rails using slider
      const slider = authenticatedPage.locator('[role="slider"]');
      await slider.fill('3');
      await authenticatedPage.waitForTimeout(500);
      
      await expect(authenticatedPage).toHaveScreenshot('railfence-with-zigzag.png');
    });
  });
});

authTest.describe('Visual Tests - Page Layouts', () => {
  authTest('should match baseline - home page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForPageStable(authenticatedPage);
    
    await expect(authenticatedPage).toHaveScreenshot('home-page.png');
  });

  authTest('should match baseline - config page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/config');
    await waitForPageStable(authenticatedPage);
    
    await expect(authenticatedPage).toHaveScreenshot('config-page.png');
  });
});

authTest.describe('Visual Tests - Theme Variations', () => {
  authTest('should match baseline - dark theme', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ciphers/caesar');
    await waitForPageStable(authenticatedPage);
    
    // Switch to dark theme
    await authenticatedPage.getByRole('button', { name: /theme/i }).click();
    await authenticatedPage.getByText(/dark/i).click();
    await authenticatedPage.waitForTimeout(500);
    
    await fillCipherInput(authenticatedPage, 'HELLO WORLD');
    
    await expect(authenticatedPage).toHaveScreenshot('caesar-dark-theme.png');
  });

  authTest('should match baseline - matrix theme', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ciphers/caesar');
    await waitForPageStable(authenticatedPage);
    
    // Switch to matrix theme
    await authenticatedPage.getByRole('button', { name: /theme/i }).click();
    await authenticatedPage.getByText(/matrix/i).click();
    await page.waitForTimeout(1000); // Matrix theme may have animations
    
    await fillCipherInput(authenticatedPage, 'HELLO WORLD');
    
    await expect(authenticatedPage).toHaveScreenshot('caesar-matrix-theme.png');
  });
});