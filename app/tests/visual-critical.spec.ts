import { expect, Page } from '@playwright/test';
import { test } from './fixtures/auth';

/**
 * Critical Visual Regression Tests
 * 
 * This file contains the most important visual tests that should always pass.
 * These tests focus on the core functionality and most commonly used features.
 */

// Focus on the most important themes for critical tests
const CRITICAL_THEMES = ['light', 'dark'] as const;
type CriticalTheme = typeof CRITICAL_THEMES[number];

// Most important cipher pages
const CRITICAL_CIPHERS = [
  { path: '/ciphers/caesar', name: 'Caesar' },
  { path: '/ciphers/morse', name: 'Morse' },
  { path: '/ciphers/keyword', name: 'Keyword' },
] as const;

/**
 * Helper function to set theme efficiently
 */
async function setTheme(page: Page, theme: CriticalTheme): Promise<void> {
  await page.addInitScript((themeToSet) => {
    localStorage.setItem('vite-ui-theme', themeToSet);
  }, theme);
  
  await page.evaluate((themeToSet) => {
    document.body.classList.remove('light', 'dark', 'matrix', 'emoji');
    document.body.classList.add(themeToSet);
  }, theme);
  
  await page.waitForTimeout(200);
}

/**
 * Prepare page for consistent screenshots
 */
async function preparePage(page: Page): Promise<void> {
  // Disable animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Disable specific animations */
      .animate-pulse, .animate-spin, .animate-bounce {
        animation: none !important;
      }
      
      /* Stabilize matrix background */
      .matrix-background * {
        animation: none !important;
      }
      
      /* Stabilize emoji background */
      .emoji-background * {
        animation: none !important;
      }
    `
  });
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('Critical Visual Regression Tests', () => {
  
  test.describe('Core Pages', () => {
    CRITICAL_THEMES.forEach(theme => {
      test(`Home page - ${theme} theme`, async ({ page }) => {
        await setTheme(page, theme);
        await page.goto('/');
        await preparePage(page);
        
        await expect(page).toHaveScreenshot(`critical-home-${theme}.png`, {
          fullPage: true,
        });
      });
    });
  });

  test.describe('Critical Cipher Pages', () => {
    CRITICAL_CIPHERS.forEach(cipher => {
      CRITICAL_THEMES.forEach(theme => {
        test(`${cipher.name} cipher - ${theme} theme`, async ({ authenticatedPage }) => {
          await setTheme(authenticatedPage, theme);
          await authenticatedPage.goto(cipher.path);
          await preparePage(authenticatedPage);
          
          await expect(authenticatedPage).toHaveScreenshot(`critical-${cipher.name.toLowerCase()}-${theme}.png`, {
            fullPage: true,
          });
        });
      });
    });
  });

  test.describe('Core UI Components', () => {
    CRITICAL_THEMES.forEach(theme => {
      test(`Cipher interface components - ${theme} theme`, async ({ authenticatedPage }) => {
        await setTheme(authenticatedPage, theme);
        await authenticatedPage.goto('/ciphers/caesar');
        await preparePage(authenticatedPage);
        
        // Test mode toggle
        const modeToggle = authenticatedPage.locator('.bg-muted\\/50.p-1.rounded-xl');
        await expect(modeToggle).toHaveScreenshot(`critical-mode-toggle-${theme}.png`);
        
        // Test cipher inputs area - use the input with correct placeholder
        const inputsArea = authenticatedPage.locator('input[placeholder="Enter your message here"]');
        await expect(inputsArea).toHaveScreenshot(`critical-inputs-${theme}.png`);
      });
    });
  });

  test.describe('Theme-Specific Features', () => {
    test('Matrix theme background', async ({ page }) => {
      await setTheme(page, 'dark'); // Matrix builds on dark theme
      await page.goto('/');
      
      // Apply matrix theme
      await page.evaluate(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add('matrix');
      });
      
      await preparePage(page);
      
      // Focus on the background area
      await expect(page.locator('body')).toHaveScreenshot('critical-matrix-background.png');
    });

    test('Emoji theme background', async ({ page }) => {
      await setTheme(page, 'light'); // Emoji builds on light theme
      await page.goto('/');
      
      // Apply emoji theme
      await page.evaluate(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add('emoji');
      });
      
      await preparePage(page);
      
      // Focus on the background area
      await expect(page.locator('body')).toHaveScreenshot('critical-emoji-background.png');
    });
  });

  test.describe('Responsive Critical Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
    ];

    viewports.forEach(viewport => {
      CRITICAL_THEMES.forEach(theme => {
        test(`Caesar cipher - ${viewport.name} - ${theme}`, async ({ authenticatedPage }) => {
          await authenticatedPage.setViewportSize({ width: viewport.width, height: viewport.height });
          await setTheme(authenticatedPage, theme);
          await authenticatedPage.goto('/ciphers/caesar');
          await preparePage(authenticatedPage);
          
          await expect(authenticatedPage).toHaveScreenshot(`critical-caesar-${viewport.name}-${theme}.png`, {
            fullPage: true,
          });
        });
      });
    });
  });

  test.describe('Error States', () => {
    CRITICAL_THEMES.forEach(theme => {
      test(`API error notification - ${theme} theme`, async ({ authenticatedPage }) => {
        // Mock API failure
        await authenticatedPage.route('**/api.datamuse.com/**', route => {
          route.abort('failed');
        });
        
        await setTheme(authenticatedPage, theme);
        await authenticatedPage.goto('/ciphers/keyword');
        
        // Switch to crack mode to trigger API call
        await authenticatedPage.getByRole('button', { name: /crack/i }).click();
        await authenticatedPage.waitForTimeout(1000);
        
        await preparePage(authenticatedPage);
        
        // Look for the API status notification
        const notification = authenticatedPage.locator('[class*="api-status"], [class*="warning"], [class*="error"]').first();
        if (await notification.isVisible()) {
          await expect(notification).toHaveScreenshot(`critical-api-error-${theme}.png`);
        }
      });
    });
  });
});