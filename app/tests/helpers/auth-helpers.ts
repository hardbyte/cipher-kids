import type { Page } from '@playwright/test';

/**
 * Waits for React authentication context to properly initialize
 * and verifies we're not stuck on the login screen
 */
export async function waitForAuthState(page: Page): Promise<void> {
  try {
    // Wait for React to hydrate and process localStorage with a reasonable timeout
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch {
    // If networkidle fails, try domcontentloaded as fallback
    console.warn('Network idle timeout, falling back to domcontentloaded');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    // Add additional wait for React to initialize
    await page.waitForTimeout(1000);
  }
  
  // Wait for either authenticated content or login screen to appear
  await Promise.race([
    // Authenticated: cipher page heading should be visible
    page.locator('h1, h2, h3').first().waitFor({ state: 'visible', timeout: 8000 }),
    // Not authenticated: login screen should be visible
    page.getByRole('heading', { name: /who's coding today/i }).waitFor({ state: 'visible', timeout: 8000 })
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
  const url = new URL(path, 'http://localhost:5173');
  url.searchParams.set('animSpeed', '0.001'); // Ultra fast animations for tests
  
  await page.goto(url.toString());
  await waitForAuthState(page);
}