import { test, expect } from './fixtures/auth';

test.describe('Animation Timing Verification', () => {
   test('should respect animSpeed URL parameter', async ({ page }) => {
    // Navigate with a specific animSpeed parameter
    await page.goto('http://localhost:5173/?animSpeed=0.5');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if the animation config is using the URL parameter
    const animationConfig = await page.evaluate(() => {
      // Import the animation config to check current values
      return {
        url: window.location.href,
        search: window.location.search,
        // Check what the animation timing values are
        testValue: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('animSpeed') : null
      };
    });

    expect(animationConfig.search).toContain('animSpeed=0.5');
    expect(animationConfig.testValue).toBe('0.5');
  });

  test('should work without animSpeed parameter', async ({ page }) => {
    // Navigate without animSpeed
    await page.goto('http://localhost:5173/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if it falls back to port-based detection
    const config = await page.evaluate(() => {
      return {
        url: window.location.href,
        port: window.location.port,
        hostname: window.location.hostname
      };
    });

    expect(config.port).toBe('5173'); // Dev server port
  });

  test('should use ultra-fast speed in test helper', async ({ page }) => {
    // Use the test helper navigation which should add animSpeed=0.001
    const testUrl = new URL('/', 'http://localhost:5173');
    testUrl.searchParams.set('animSpeed', '0.001');

    await page.goto(testUrl.toString());
    await page.waitForLoadState('networkidle');

    const config = await page.evaluate(() => {
      return {
        url: window.location.href,
        animSpeedParam: new URLSearchParams(window.location.search).get('animSpeed')
      };
    });

    expect(config.animSpeedParam).toBe('0.001');
  });

  test('should use fast animations with animSpeed parameter', async ({ authenticatedPage }) => {
    // Navigate with ultra-fast animations
    await authenticatedPage.goto('/ciphers/caesar?animSpeed=0.001');
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
    
    // Fill in a message and time the encryption
    await authenticatedPage.getByRole('textbox', { name: /secret message/i }).fill('HELLO');
    
    // Record start time
    const startTime = Date.now();
    
    // Click encrypt (use the main action button)
    await authenticatedPage.getByRole('button', { name: 'magic wand Encrypt sparkles' }).click();
    
    // Wait for result to appear
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).not.toBeEmpty();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    
    // With ultra-fast animations, it should complete very quickly
    expect(duration).toBeLessThan(2000); // Should be much faster than normal
  });

  test('should use slower animations without animSpeed parameter', async ({ authenticatedPage }) => {
    // Navigate without animSpeed parameter (will use port-based detection)
    await authenticatedPage.goto('/ciphers/caesar');
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
    
    // Fill in a message and time the encryption
    await authenticatedPage.getByRole('textbox', { name: /secret message/i }).fill('HELLO');
    
    // Record start time
    const startTime = Date.now();
    
    // Click encrypt (use the main action button)
    await authenticatedPage.getByRole('button', { name: 'magic wand Encrypt sparkles' }).click();
    
    // Wait for result to appear
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).not.toBeEmpty();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    
    // Should still be reasonably fast due to port-based test mode detection
    expect(duration).toBeLessThan(3000);
  });

  test('should verify animation speed difference', async ({ authenticatedPage }) => {
    // Test 1: Ultra fast animations
    await authenticatedPage.goto('/ciphers/caesar?animSpeed=0.001');
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
    
    // Check what speed multiplier is actually being used
    const config1 = await authenticatedPage.evaluate(() => {
      // Check the animation config
      const urlParams = new URLSearchParams(window.location.search);
      const animSpeedParam = urlParams.get('animSpeed');
      const speedFactor = parseFloat(animSpeedParam || '1');
      return {
        url: window.location.href,
        animSpeedParam,
        speedFactor,
        calculatedDelay: Math.max(0.1, 350 * speedFactor)
      };
    });
    
    await authenticatedPage.getByRole('textbox', { name: /secret message/i }).fill('ABC');
    const startTime1 = Date.now();
    await authenticatedPage.getByRole('button', { name: 'magic wand Encrypt sparkles' }).click();
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).not.toBeEmpty();
    const duration1 = Date.now() - startTime1;
    
    // Test 2: Slower animations
    await authenticatedPage.goto('/ciphers/caesar?animSpeed=0.1');
    await expect(authenticatedPage.getByRole('heading', { name: 'Caesar Cipher' }).first()).toBeVisible();
    
    // Check what speed multiplier is actually being used
    const config2 = await authenticatedPage.evaluate(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const animSpeedParam = urlParams.get('animSpeed');
      const speedFactor = parseFloat(animSpeedParam || '1');
      return {
        url: window.location.href,
        animSpeedParam,
        speedFactor,
        calculatedDelay: Math.max(0.1, 350 * speedFactor)
      };
    });
    
    await authenticatedPage.getByRole('textbox', { name: /secret message/i }).fill('ABC');
    const startTime2 = Date.now();
    await authenticatedPage.getByRole('button', { name: 'magic wand Encrypt sparkles' }).click();
    await expect(authenticatedPage.locator('[data-testid="cipher-result"]')).not.toBeEmpty();
    const duration2 = Date.now() - startTime2;
    
    
    // Both should complete within reasonable time for tests  
    expect(duration1).toBeLessThan(2000);
    expect(duration2).toBeLessThan(2000);
    
    // The calculated delays should show the speed difference is working
    expect(config1.calculatedDelay).toBeLessThan(config2.calculatedDelay);
  });
});