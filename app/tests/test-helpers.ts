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
 * Helper to click encrypt/decrypt buttons
 * Targets the main action button with icons (magic wand, sparkles)
 */
export async function clickCipherAction(page: Page, action: 'encrypt' | 'decrypt'): Promise<void> {
  // Look for the main action button that has icons (not the mode button)
  let button = page.getByRole('button', { name: new RegExp(`magic wand ${action}|${action} sparkles`, 'i') });
  
  // Fallback: look for any button with the action name but prefer the last one (main action)
  if (await button.count() === 0) {
    button = page.getByRole('button', { name: new RegExp(action, 'i') }).last();
  }
  
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
  
  // Wait a moment for the action to be processed
  await page.waitForTimeout(100);
}

/**
 * Helper to get cipher result text
 * Uses a direct approach based on observing the actual DOM structure
 */
export async function getCipherResult(page: Page): Promise<string> {
  // Wait for result to be processed and displayed
  await page.waitForTimeout(3000);
  
  // Look for any text element that contains cipher-like content
  // Based on observation, results appear as standalone text elements
  
  let stableResult = '';
  let stableCount = 0;
  const maxAttempts = 20;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Get all text content on page and filter for likely results
      const allText = await page.locator('*').allTextContents();
      
      // Find cipher result by looking for patterns
      const candidates = allText.filter(text => {
        const trimmed = text.trim();
        return (
          trimmed.length >= 3 && 
          trimmed.length <= 50 &&
          // Must be primarily letters/cipher characters
          /^[A-Z\s\-\.┘┴└┤┼├┐┬┌><V\^]+$/i.test(trimmed) &&
          // Exclude UI text
          !trimmed.includes('Copy') &&
          !trimmed.includes('Result') &&
          !trimmed.includes('Enter your message') &&
          !trimmed.includes('Step-by-Step') &&
          !trimmed.includes('Characters:') &&
          !trimmed.includes('Show Animation') &&
          !trimmed.includes('Try Sample') &&
          !trimmed.includes('How It Works') &&
          !trimmed.includes('Encrypt') &&
          !trimmed.includes('Decrypt') &&
          !trimmed.includes('ABCDEFGHIJKLMNOPQRSTUVWXYZ') &&
          // Skip alphabet mapping and arrows
          !trimmed.match(/^[A-Z]\s*↓\s*[A-Z]$/) &&
          !trimmed.match(/^[↓\s]+$/) &&
          // Skip Vigenère key/plaintext visualization patterns
          !trimmed.match(/^[A-Z\s]+H\s+E\s+L\s+L\s+O/) &&
          !trimmed.match(/^K\s+E\s+Y/) &&
          !(trimmed === 'KEYKE') &&
          !(trimmed === 'HELLO') &&
          // Should look like a cipher result
          (trimmed.match(/^[A-Z]{3,}$/) || // All caps
           trimmed.match(/^[A-Z\s]{3,}$/) || // All caps with spaces
           trimmed.match(/^[\-\.]{3,}$/) || // Morse code
           trimmed.match(/^[┘┴└┤┼├┐┬┌><V\^\.]+$/)) // Pigpen
        );
      });
      
      // Get the most likely result (often the longest meaningful sequence)
      const currentResult = candidates
        .filter(c => c.length >= 3)
        .sort((a, b) => b.length - a.length)[0] || '';
      
      if (currentResult && currentResult === stableResult) {
        stableCount++;
        if (stableCount >= 3) {
          return currentResult.trim();
        }
      } else if (currentResult) {
        stableResult = currentResult;
        stableCount = 0;
      }
    } catch (e) {
      // Continue trying
    }
    
    await page.waitForTimeout(500);
  }
  
  throw new Error(`Could not find stable cipher result. Best candidate: "${stableResult}"`);
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