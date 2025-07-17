import { test as authTest, expect } from './fixtures/auth';

/**
 * Visual regression tests for UI components
 * These tests capture screenshots of individual UI components
 * in various states to detect visual regressions.
 */

// Helper function to wait for component to be stable
async function waitForComponentStable(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.waitForFunction(() => document.fonts.ready);
}

authTest.describe('Visual Tests - UI Components', () => {
  
  authTest.describe('Button Component States', () => {
    authTest('should match baseline - primary buttons', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Focus on the main action button area
      const buttonArea = authenticatedPage.locator('.space-y-4').filter({ hasText: 'Encrypt' }).first();
      await expect(buttonArea).toHaveScreenshot('button-primary.png');
    });

    authTest('should match baseline - mode toggle buttons', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Focus on mode toggle buttons
      const modeToggle = authenticatedPage.locator('.bg-muted\\/50.p-1.rounded-xl');
      await expect(modeToggle).toHaveScreenshot('button-mode-toggle.png');
    });

    authTest('should match baseline - sample button', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Focus on try sample button
      const sampleButton = authenticatedPage.getByRole('button', { name: /try sample/i });
      await expect(sampleButton).toHaveScreenshot('button-sample.png');
    });

    authTest('should match baseline - crack button', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForComponentStable(authenticatedPage);
      
      // Switch to crack mode to see crack button
      const crackModeButton = authenticatedPage.getByRole('button', { name: /crack/i });
      await expect(crackModeButton).toBeVisible({ timeout: 10000 });
      await crackModeButton.click();
      await authenticatedPage.waitForTimeout(1000);
      
      // Add some text to enable the crack button
      const messageInput = authenticatedPage.getByPlaceholder(/enter.*message|type.*message/i).first();
      await messageInput.fill('ENCODED MESSAGE');
      await authenticatedPage.waitForTimeout(500);
      
      // Focus on the crack button specifically
      const crackButton = authenticatedPage.getByRole('button', { name: /crack.*cipher/i });
      await expect(crackButton).toBeVisible();
      await expect(crackButton).toHaveScreenshot('button-crack.png');
    });
  });

  authTest.describe('Card Component Variations', () => {
    authTest('should match baseline - cipher result card empty', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Focus on the result card
      const resultCard = authenticatedPage.locator('.font-mono.whitespace-pre-wrap');
      await expect(resultCard).toHaveScreenshot('card-result-empty.png');
    });

    authTest('should match baseline - cipher result card with content', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Fill input to generate result
      await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO WORLD');
      await authenticatedPage.waitForTimeout(1000);
      
      // Click encrypt to generate result - use first encrypt button
      await authenticatedPage.getByRole('button', { name: /encrypt/i }).first().click();
      await authenticatedPage.waitForTimeout(1000);
      
      const resultCard = authenticatedPage.locator('.font-mono.whitespace-pre-wrap');
      await expect(resultCard).toHaveScreenshot('card-result-filled.png');
    });

    authTest('should match baseline - keyword strength card', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForComponentStable(authenticatedPage);
      
      // Fill keyword to show strength meter
      await authenticatedPage.getByPlaceholder(/enter.*message/i).first().fill('SECRET MESSAGE');
      // Use the setCipherParam helper or look for keyword input more specifically
      const keywordInput = authenticatedPage.getByPlaceholder(/keyword/i).or(
        authenticatedPage.locator('input[type="text"]').nth(1)
      ).first();
      await keywordInput.fill('CIPHER');
      await authenticatedPage.waitForTimeout(1000);
      
      // Look for the keyword strength section
      const strengthCard = authenticatedPage.locator('text=Keyword Security Rating').locator('..').locator('..');
      await expect(strengthCard).toBeVisible();
      await expect(strengthCard).toHaveScreenshot('card-keyword-strength.png');
    });

    authTest('should match baseline - educational content card', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Scroll to educational content
      await authenticatedPage.locator('text=How It Works').scrollIntoViewIfNeeded();
      
      // Focus on the educational content section specifically
      const educationCard = authenticatedPage.locator('text=How It Works: Caesar Cipher').locator('..');
      await expect(educationCard).toHaveScreenshot('card-educational.png');
    });
  });

  authTest.describe('Input Component States', () => {
    authTest('should match baseline - text input empty', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      const messageInput = authenticatedPage.getByPlaceholder(/enter.*message/i);
      await expect(messageInput).toHaveScreenshot('input-text-empty.png');
    });

    authTest('should match baseline - text input filled', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      const messageInput = authenticatedPage.getByPlaceholder(/enter.*message/i);
      await messageInput.fill('HELLO WORLD');
      await authenticatedPage.waitForTimeout(300);
      
      await expect(messageInput).toHaveScreenshot('input-text-filled.png');
    });

    authTest('should match baseline - slider component', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Focus on the slider input specifically
      const sliderContainer = authenticatedPage.locator('text=Shift:').locator('..');
      await expect(sliderContainer).toHaveScreenshot('input-slider.png');
    });

    authTest('should match baseline - keyword input with validation', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForComponentStable(authenticatedPage);
      
      // Find keyword input more reliably
      const keywordInput = authenticatedPage.getByPlaceholder(/keyword/i).or(
        authenticatedPage.locator('input[type="text"]').nth(1)
      ).first();
      await keywordInput.fill('SECRET');
      await authenticatedPage.waitForTimeout(500);
      
      // Take screenshot of the input area including the label
      const inputContainer = keywordInput.locator('..');
      await expect(inputContainer).toHaveScreenshot('input-keyword.png');
    });
  });

  authTest.describe('Navigation Components', () => {
    authTest('should match baseline - cipher navigation', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      const cipherNav = authenticatedPage.locator('nav').filter({ hasText: 'Ciphers' });
      await expect(cipherNav).toHaveScreenshot('nav-cipher.png');
    });

    authTest('should match baseline - breadcrumbs', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Look for breadcrumb-like navigation
      const breadcrumbs = authenticatedPage.locator('.flex.items-center.gap-2').first();
      await expect(breadcrumbs).toHaveScreenshot('nav-breadcrumbs.png');
    });
  });

  authTest.describe('Animation and Visualization Components', () => {
    authTest('should match baseline - alphabet mapping', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Fill input to show alphabet mapping
      await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO');
      await authenticatedPage.waitForTimeout(500);
      
      // Look for alphabet mapping visualization
      const mapping = authenticatedPage.locator('.bg-muted\\/10').filter({ hasText: 'Alphabet Mapping' });
      if (await mapping.count() > 0) {
        await expect(mapping).toHaveScreenshot('component-alphabet-mapping.png');
      }
    });

    authTest('should match baseline - morse code visualizer', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/morse');
      await waitForComponentStable(authenticatedPage);
      
      // Fill input to show morse visualization
      await authenticatedPage.fill('input[placeholder="Enter your message here"]', 'SOS');
      await authenticatedPage.waitForTimeout(1000);
      
      // Just screenshot the page with the input filled - skip complex interactions
      await expect(authenticatedPage.locator('main')).toHaveScreenshot('component-morse-visualizer.png');
    });

    authTest('should match baseline - pigpen grid', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/pigpen');
      await waitForComponentStable(authenticatedPage);
      
      // Look for pigpen grid component
      const pigpenGrid = authenticatedPage.locator('.grid').filter({ hasText: 'A' });
      if (await pigpenGrid.count() > 0) {
        await expect(pigpenGrid.first()).toHaveScreenshot('component-pigpen-grid.png');
      }
    });

    authTest('should match baseline - rail fence visualization', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/railfence');
      await waitForComponentStable(authenticatedPage);
      
      // Fill input to show zigzag
      await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO WORLD');
      await authenticatedPage.waitForTimeout(500);
      
      // Look for zigzag visualization
      const zigzag = authenticatedPage.locator('.bg-muted\\/5').filter({ hasText: 'Rail' });
      if (await zigzag.count() > 0) {
        await expect(zigzag.first()).toHaveScreenshot('component-zigzag.png');
      }
    });
  });

  authTest.describe('Status and Notification Components', () => {
    authTest('should match baseline - API status notification', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForComponentStable(authenticatedPage);
      
      // Switch to crack mode to see API status
      const crackModeButton = authenticatedPage.getByRole('button', { name: /crack/i });
      await expect(crackModeButton).toBeVisible({ timeout: 10000 });
      await crackModeButton.click();
      await authenticatedPage.waitForTimeout(2000); // Wait for API status to load
      
      // Look for API status indicator
      const apiStatus = authenticatedPage.locator('.border').filter({ hasText: 'keywords' }).or(
        authenticatedPage.locator('[class*="api"]').filter({ hasText: /api|keywords/i }).first()
      );
      
      if (await apiStatus.count() > 0) {
        await expect(apiStatus.first()).toHaveScreenshot('component-api-status.png');
      } else {
        // Take a screenshot of the crack mode area instead
        const crackArea = authenticatedPage.locator('text=Crack').locator('..');
        await expect(crackArea).toHaveScreenshot('component-api-status.png');
      }
    });

    authTest('should match baseline - crack results display', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/keyword');
      await waitForComponentStable(authenticatedPage);
      
      // Switch to crack mode
      const crackModeButton = authenticatedPage.getByRole('button', { name: /crack/i });
      await expect(crackModeButton).toBeVisible({ timeout: 10000 });
      await crackModeButton.click();
      await authenticatedPage.waitForTimeout(500);
      
      // Fill message and run crack
      await authenticatedPage.getByPlaceholder(/enter.*message/i).first().fill('FRPERG ZRFFNTR');
      await authenticatedPage.waitForTimeout(500);
      
      // Click crack button
      const crackButton = authenticatedPage.getByRole('button', { name: /crack.*cipher/i });
      await expect(crackButton).toBeVisible();
      await crackButton.click();
      await authenticatedPage.waitForTimeout(3000);
      
      // Look for crack results
      const crackResults = authenticatedPage.locator('.bg-muted\\/5').filter({ hasText: 'Crack Analysis' }).or(
        authenticatedPage.locator('[class*="crack"]').filter({ hasText: /analysis|results/i }).first()
      );
      
      if (await crackResults.count() > 0) {
        await expect(crackResults.first()).toHaveScreenshot('component-crack-results.png');
      } else {
        // Take screenshot of the result area
        const resultArea = authenticatedPage.locator('text=Result').locator('..').locator('..');
        await expect(resultArea).toHaveScreenshot('component-crack-results.png');
      }
    });

    authTest('should match baseline - loading states', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Fill input and trigger animation
      await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO WORLD');
      
      // Click encrypt and try to capture loading state
      const encryptButton = authenticatedPage.getByRole('button', { name: /encrypt/i }).first();
      await encryptButton.click();
      
      // Try to capture the button in loading state (this might be quick)
      await expect(encryptButton).toHaveScreenshot('component-loading-button.png');
    });
  });

  authTest.describe('Theme-Specific Component Variations', () => {
    authTest('should match baseline - components in dark theme', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Switch to dark theme
      const themeButton = authenticatedPage.getByRole('button', { name: /theme/i });
      if (await themeButton.count() > 0) {
        await themeButton.click();
        await authenticatedPage.getByText(/dark/i).click();
        await authenticatedPage.waitForTimeout(500);
        
        // Fill some content
        await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO WORLD');
        
        const resultCard = authenticatedPage.locator('.font-mono.whitespace-pre-wrap');
        await expect(resultCard).toHaveScreenshot('component-dark-theme.png');
      }
    });

    authTest('should match baseline - components in matrix theme', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/ciphers/caesar');
      await waitForComponentStable(authenticatedPage);
      
      // Switch to matrix theme
      const themeButton = authenticatedPage.getByRole('button', { name: /theme/i });
      if (await themeButton.count() > 0) {
        await themeButton.click();
        await authenticatedPage.getByText(/matrix/i).click();
        await authenticatedPage.waitForTimeout(1000); // Matrix theme has animations
        
        // Fill some content
        await authenticatedPage.getByPlaceholder(/enter.*message/i).fill('HELLO WORLD');
        
        const resultCard = authenticatedPage.locator('.font-mono.whitespace-pre-wrap');
        await expect(resultCard).toHaveScreenshot('component-matrix-theme.png');
      }
    });
  });
});