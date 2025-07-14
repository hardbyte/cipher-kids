import { Page } from '@playwright/test';

/**
 * Waits for React authentication context to properly initialize
 * and verifies we're not stuck on the login screen
 */
export async function waitForAuthState(page: Page): Promise<void> {
  // Wait for React to hydrate and process localStorage
  await page.waitForLoadState('networkidle');
  
  // Wait for either authenticated content or login screen to appear
  await Promise.race([
    // Authenticated: cipher page heading should be visible
    page.locator('h1, h2, h3').first().waitFor({ state: 'visible', timeout: 5000 }),
    // Not authenticated: login screen should be visible
    page.getByRole('heading', { name: /who's coding today/i }).waitFor({ state: 'visible', timeout: 5000 })
  ]);
  
  // Verify we're authenticated (not on login screen)
  const isOnLoginScreen = await page.getByRole('heading', { name: /who's coding today/i }).isVisible();
  if (isOnLoginScreen) {
    throw new Error('Authentication failed - still on login screen');
  }
}

/**
 * Navigates to a path and waits for authentication state to be properly initialized
 * Automatically adds test speed parameter for faster animations
 */
export async function navigateWithAuth(page: Page, path: string): Promise<void> {
  // Add animation speed parameter for tests
  const url = new URL(path, 'http://localhost:5174');
  url.searchParams.set('animSpeed', '0.001'); // Ultra fast animations for tests
  
  await page.goto(url.toString());
  await waitForAuthState(page);
}