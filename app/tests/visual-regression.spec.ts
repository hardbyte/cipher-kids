import { expect, Page } from '@playwright/test';
import { test } from './fixtures/auth';

// All available themes in the application
const THEMES = ['light', 'dark', 'matrix', 'emoji'] as const;
type Theme = typeof THEMES[number];

// All cipher pages to test
const CIPHER_PAGES = [
  { path: '/ciphers/atbash', name: 'Atbash' },
  { path: '/ciphers/caesar', name: 'Caesar' },
  { path: '/ciphers/keyword', name: 'Keyword' },
  { path: '/ciphers/morse', name: 'Morse' },
  { path: '/ciphers/pigpen', name: 'Pigpen' },
  { path: '/ciphers/railfence', name: 'Rail Fence' },
  { path: '/ciphers/vigenere', name: 'Vigenère' },
] as const;

/**
 * Helper function to set theme and wait for it to apply
 */
async function setTheme(page: Page, theme: Theme): Promise<void> {
  // Set theme via localStorage to avoid navigation
  await page.addInitScript((themeToSet) => {
    localStorage.setItem('vite-ui-theme', themeToSet);
  }, theme);
  
  // Apply theme class to body
  await page.evaluate((themeToSet) => {
    // Remove existing theme classes
    document.body.classList.remove('light', 'dark', 'matrix', 'emoji');
    // Add new theme class
    document.body.classList.add(themeToSet);
    
    // Trigger theme change event if needed
    window.dispatchEvent(new CustomEvent('themechange', { detail: themeToSet }));
  }, theme);
  
  // Wait for theme to apply
  await page.waitForTimeout(300);
  
  // Verify theme is applied
  await expect(page.locator('body')).toHaveClass(new RegExp(theme));
}

/**
 * Helper function to prepare page for consistent screenshots
 */
async function preparePage(page: Page): Promise<void> {
  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Hide dynamic elements that change between runs */
      .animate-pulse,
      .animate-spin,
      .animate-bounce {
        animation: none !important;
      }
    `
  });
  
  // Wait for fonts and images to load
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for any remaining async operations
  await page.waitForTimeout(1000);
}

test.describe('Visual Regression Tests', () => {
  
  test.describe('Home Page', () => {
    THEMES.forEach(theme => {
      test(`Home page - ${theme} theme`, async ({ page }) => {
        await page.goto('/');
        await setTheme(page, theme);
        await preparePage(page);
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`home-${theme}.png`, {
          fullPage: true,
        });
      });
    });
  });

  test.describe('Config Page', () => {
    THEMES.forEach(theme => {
      test(`Config page - ${theme} theme`, async ({ page }) => {
        await page.goto('/config');
        await setTheme(page, theme);
        await preparePage(page);
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`config-${theme}.png`, {
          fullPage: true,
        });
      });
    });
  });

  test.describe('Cipher Pages - Full Page', () => {
    CIPHER_PAGES.forEach(cipher => {
      THEMES.forEach(theme => {
        test(`${cipher.name} cipher page - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.goto(cipher.path);
          await setTheme(authenticatedPage, theme);
          await preparePage(authenticatedPage);
          
          // Take full page screenshot
          await expect(authenticatedPage).toHaveScreenshot(`cipher-${cipher.name.toLowerCase()}-${theme}.png`, {
            fullPage: true,
          });
        });
      });
    });
  });

  test.describe('Cipher Pages - Different Modes', () => {
    // Test different cipher modes (encrypt/decrypt/crack) for visual consistency
    const MODES = ['encrypt', 'decrypt', 'crack'] as const;
    
    MODES.forEach(mode => {
      THEMES.forEach(theme => {
        test(`Caesar cipher - ${mode} mode - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.goto('/ciphers/caesar');
          await setTheme(authenticatedPage, theme);
          
          // Switch to the desired mode
          if (mode !== 'encrypt') {
            const modeButton = authenticatedPage.getByRole('button', { name: new RegExp(mode, 'i') });
            await modeButton.click();
            await authenticatedPage.waitForTimeout(300);
          }
          
          await preparePage(authenticatedPage);
          
          // Take screenshot of the cipher interface
          await expect(authenticatedPage.locator('main')).toHaveScreenshot(`caesar-${mode}-${theme}.png`);
        });
      });
    });
  });

  test.describe('UI Components', () => {
    // Test individual UI components in isolation
    
    test.describe('Buttons', () => {
      THEMES.forEach(theme => {
        test(`Button components - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.goto('/ciphers/caesar');
          await setTheme(authenticatedPage, theme);
          await preparePage(authenticatedPage);
          
          // Screenshot of various button states - use the mode toggle container
          const buttonContainer = authenticatedPage.locator('.bg-muted\\/50.p-1.rounded-xl');
          await expect(buttonContainer).toHaveScreenshot(`buttons-${theme}.png`);
        });
      });
    });

    test.describe('Mode Toggle', () => {
      THEMES.forEach(theme => {
        test(`Mode toggle component - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.goto('/ciphers/caesar');
          await setTheme(authenticatedPage, theme);
          await preparePage(authenticatedPage);
          
          // Screenshot of mode toggle
          const modeToggle = authenticatedPage.locator('.bg-muted\\/50.p-1.rounded-xl');
          await expect(modeToggle).toHaveScreenshot(`mode-toggle-${theme}.png`);
        });
      });
    });

    // Note: Cipher result component tests moved to visual-components.spec.ts for better organization

    test.describe('Navigation', () => {
      THEMES.forEach(theme => {
        test(`Navigation component - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.goto('/ciphers/caesar');
          await setTheme(authenticatedPage, theme);
          await preparePage(authenticatedPage);
          
          // Screenshot of cipher navigation - use the main navigation area
          const navigation = authenticatedPage.locator('nav').first();
          await expect(navigation).toHaveScreenshot(`navigation-${theme}.png`);
        });
      });
    });
  });

  test.describe('Theme-Specific Features', () => {
    test('Matrix theme - animated background', async ({ page }) => {
      await page.goto('/');
      await setTheme(page, 'matrix');
      
      // Disable matrix animation for consistent screenshot
      await page.addStyleTag({
        content: `
          .matrix-background * {
            animation: none !important;
          }
        `
      });
      
      await preparePage(page);
      
      // Take screenshot focusing on the background
      await expect(page).toHaveScreenshot('matrix-background.png', {
        fullPage: true,
      });
    });

    test('Emoji theme - emoji background', async ({ page }) => {
      await page.goto('/');
      await setTheme(page, 'emoji');
      
      // Disable emoji animation for consistent screenshot
      await page.addStyleTag({
        content: `
          .emoji-background * {
            animation: none !important;
          }
        `
      });
      
      await preparePage(page);
      
      // Take screenshot focusing on the background
      await expect(page).toHaveScreenshot('emoji-background.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Responsive Design', () => {
    // Test different viewport sizes with different themes
    const VIEWPORTS = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ] as const;

    VIEWPORTS.forEach(viewport => {
      ['light', 'dark'].forEach(theme => {
        test(`Caesar cipher - ${viewport.name} - ${theme} theme`, async ({ authenticatedPage }) => {
          await authenticatedPage.setViewportSize({ width: viewport.width, height: viewport.height });
          await authenticatedPage.goto('/ciphers/caesar');
          await setTheme(authenticatedPage, theme as Theme);
          await preparePage(authenticatedPage);
          
          // Take full page screenshot
          await expect(authenticatedPage).toHaveScreenshot(`caesar-${viewport.name}-${theme}.png`, {
            fullPage: true,
          });
        });
      });
    });
  });

  // Note: API error state tests removed due to complexity with route mocking
  // The API status notification is tested in the critical tests instead
});