import { Page } from '@playwright/test';

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
    localStorage.setItem('cipher-app-enabled-ciphers', JSON.stringify(['atbash', 'caesar', 'keyword', 'railfence', 'vigenere']));
    
    // Set user config with default theme
    localStorage.setItem(`cipher-app-user-config-${userId}`, JSON.stringify({ theme: 'dark' }));
  }, userId);
  
  // Wait for the user context to be ready by checking for authenticated state
  await page.waitForLoadState('networkidle');
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
 * Helper to click encrypt/decrypt buttons
 */
export async function clickCipherAction(page: Page, action: 'encrypt' | 'decrypt'): Promise<void> {
  const button = page.getByRole('button', { name: new RegExp(action, 'i') }).last();
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
}

/**
 * Helper to get cipher result text
 */
export async function getCipherResult(page: Page): Promise<string> {
  // Wait for result element to appear and be visible
  const resultElement = page.locator('[data-testid="cipher-result"]');
  await resultElement.waitFor({ state: 'visible', timeout: 10000 });
  
  const text = await resultElement.textContent();
  if (!text?.trim()) {
    throw new Error('Cipher result is empty');
  }
  
  return text.trim();
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