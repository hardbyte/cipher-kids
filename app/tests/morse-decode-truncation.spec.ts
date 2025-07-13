import { test, expect } from '@playwright/test';
import { setupUserSession } from './test-helpers';

test.describe('Morse Code Decode Truncation Fix', () => {
  test.beforeEach(async ({ page }) => {
    await setupUserSession(page, 'F');
    await page.goto('/ciphers/morse');
  });

  test('should decode HELLO correctly without truncation', async ({ page }) => {
    // Switch to decode mode
    await page.getByRole('button', { name: 'unlock Decrypt' }).click();
    
    // Enter morse code for HELLO
    await page.getByRole('textbox', { name: 'Your Secret Message' }).fill('.... . .-.. .-.. ---');
    
    // Click decrypt button
    await page.getByRole('button', { name: 'magic wand Decrypt sparkles' }).click();
    
    // Wait for animation to complete
    await page.waitForTimeout(2000);
    
    // Check the result is HELLO, not HELL
    const result = await page.locator('[data-testid="cipher-result"]').textContent();
    expect(result).toBe('HELLO');
  });

  test('should decode multiple words correctly', async ({ page }) => {
    // Switch to decode mode
    await page.getByRole('button', { name: 'unlock Decrypt' }).click();
    
    // Enter morse code for HELLO WORLD
    await page.getByRole('textbox', { name: 'Your Secret Message' }).fill('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
    
    // Click decrypt button
    await page.getByRole('button', { name: 'magic wand Decrypt sparkles' }).click();
    
    // Wait for animation to complete
    await page.waitForTimeout(3000);
    
    // Check the result
    const result = await page.locator('[data-testid="cipher-result"]').textContent();
    expect(result).toBe('HELLO WORLD');
  });

  test('should decode long messages without truncation', async ({ page }) => {
    // Switch to decode mode
    await page.getByRole('button', { name: 'unlock Decrypt' }).click();
    
    // Enter morse code for SECRET MESSAGE
    await page.getByRole('textbox', { name: 'Your Secret Message' }).fill('... . -.-. .-. . - / -- . ... ... .- --. .');
    
    // Click decrypt button
    await page.getByRole('button', { name: 'magic wand Decrypt sparkles' }).click();
    
    // Wait for animation to complete
    await page.waitForTimeout(4000);
    
    // Check the result
    const result = await page.locator('[data-testid="cipher-result"]').textContent();
    expect(result).toBe('SECRET MESSAGE');
  });
});