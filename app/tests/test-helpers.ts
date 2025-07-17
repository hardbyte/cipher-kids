import { Page, expect } from '@playwright/test';

/**
 * Sets up user state programmatically to bypass the user selection UI.
 * This is more reliable than clicking through the UI in automated tests.
 */
export async function setupUserSession(page: Page, userId: string = 'A'): Promise<void> {
  // Navigate to the app first and set localStorage before app loads
  await page.goto('/', {
    waitUntil: 'domcontentloaded'
  });
  
  // Set localStorage values that the app expects (based on UserContext)
  await page.evaluate((userId) => {
    // Set the correct localStorage key that the UserContext uses
    localStorage.setItem('cipher-app-user', userId);
    
    // Set enabled ciphers
    localStorage.setItem('cipher-app-enabled-ciphers', JSON.stringify(['atbash', 'caesar', 'keyword', 'railfence', 'vigenere', 'pigpen', 'morse']));
    
    // Set user config with default theme
    localStorage.setItem(`cipher-app-user-config-${userId}`, JSON.stringify({ theme: 'dark' }));
  }, userId);
  
  // Wait for the user context to be ready by ensuring we don't see the login screen
  // Reload the page to ensure localStorage is properly read
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Wait for authentication to be processed
  const isOnLoginScreen = await page.getByRole('heading', { name: /who's coding today/i })
    .isVisible({ timeout: 2000 })
    .catch(() => false);
    
  if (isOnLoginScreen) {
    // If still on login screen, localStorage approach didn't work
    throw new Error('User session setup failed - still on login screen');
  }
}

/**
 * Navigates to a cipher page with user already set up.
 * Includes retry logic for reliability.
 */
export async function navigateToCipherWithUser(page: Page, cipherPath: string, userId: string = 'A'): Promise<void> {
  await setupUserSession(page, userId);
  
  // Navigate to the cipher page
  await page.goto(cipherPath, { waitUntil: 'networkidle' });
  
  // Verify we're not stuck on user selection
  const onUserSelection = await page.getByRole('heading', { name: /who's coding today/i })
    .isVisible({ timeout: 2000 })
    .catch(() => false);
    
  if (onUserSelection) {
    // If still on user selection, the localStorage approach didn't work
    // Fall back to navigation from home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto(cipherPath, { waitUntil: 'networkidle' });
  }
}

/**
 * Helper to fill the message input field
 */
export async function fillMessage(page: Page, message: string): Promise<void> {
  const messageInput = page.getByRole('textbox', { name: /secret message/i });
  await messageInput.waitFor({ state: 'visible', timeout: 5000 });
  await messageInput.clear();
  await messageInput.fill(message);
}

/**
 * Helper to click encrypt/decrypt/encode/decode buttons
 * Targets the main action button with icons (magic wand, sparkles)
 */
export async function clickCipherAction(page: Page, action: 'encrypt' | 'decrypt' | 'encode' | 'decode'): Promise<void> {
  // Look for the main action button that has icons (not the mode button)
  let button = page.getByRole('button', { name: new RegExp(`magic wand ${action}|${action} sparkles`, 'i') });
  
  // Fallback: look for any button with the action name but prefer the last one (main action)
  if (await button.count() === 0) {
    button = page.getByRole('button', { name: new RegExp(action, 'i') }).last();
  }
  
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
  
  // Wait for any loading state to settle
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Helper to get cipher result using data-testid - PREFERRED METHOD
 * 
 * This is the recommended approach for getting cipher results as it:
 * - Uses a stable data-testid selector 
 * - Is not affected by UI text changes
 * - Works reliably with animations
 * - Is much simpler and more maintainable
 */
export async function getCipherResultDirect(page: Page): Promise<string> {
  // Wait for result element to appear
  const resultElement = page.locator('[data-testid="cipher-result"]');
  await expect(resultElement).toBeVisible({ timeout: 10000 });
  
  // Wait for the result to be complete (stable for at least 2 checks)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previousResult = '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stableCount = 0;
  
  await page.waitForFunction((selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;
    const text = element.textContent?.trim() || '';
    
    // Wait for meaningful content that doesn't look like it's still animating
    if (text.length === 0) return false;
    if (text.includes('...') || text.includes('loading')) return false;
    
    // Check for stability by comparing with previous result
    if (text === window._previousResult) {
      window._stableCount = (window._stableCount || 0) + 1;
      return window._stableCount >= 3;
    } else {
      window._previousResult = text;
      window._stableCount = 1;
      return false;
    }
  }, '[data-testid="cipher-result"]', { timeout: 10000 });
  
  const result = await resultElement.textContent();
  return result?.trim() || '';
}

/**
 * Helper to set slider values (for shift, rails, etc.)
 */
export async function setSliderValue(page: Page, sliderName: string, value: number): Promise<void> {
  const slider = page.getByRole('slider', { name: new RegExp(sliderName, 'i') });
  await slider.waitFor({ state: 'visible', timeout: 5000 });
  await slider.fill(value.toString());
}

/**
 * Helper to fill keyword input
 */
export async function fillKeyword(page: Page, keyword: string): Promise<void> {
  const keywordInput = page.getByRole('textbox', { name: /secret key|keyword/i });
  await keywordInput.waitFor({ state: 'visible', timeout: 5000 });
  await keywordInput.clear();
  await keywordInput.fill(keyword);
}