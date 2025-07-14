import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Enable parallel execution for faster test runs */
  workers: process.env.CI ? '50%' : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters --reporter=line|html|list|json*/
  reporter: process.env.CI ? 'github' : 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5174',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Visual testing configuration */
    screenshot: 'only-on-failure',
  },

  /* Visual testing configuration */
  expect: {
    /* Threshold for visual comparisons (0-1, where 0 = exact match) */
    toHaveScreenshot: { 
      threshold: 0.2, // Allow for minor rendering differences
      mode: 'strict', // Strict mode for consistent results
      animations: 'disabled', // Disable animations for consistent screenshots
    },
    /* Threshold for visual comparisons */
    toMatchSnapshot: { threshold: 0.2 },
  },

  /* Visual testing configuration */
  expect: {
    /* Configure visual comparison threshold */
    toHaveScreenshot: { 
      threshold: 0.2,
      mode: 'strict',
      animations: 'disabled',
    },
    toMatchSnapshot: { 
      threshold: 0.2,
      mode: 'strict',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    /* Test against mobile viewports - Important - app designed for mobile use. */
    {
      name: 'Mobile Chrome',
      testIgnore: ['**/visual*.spec.ts'], // Exclude visual tests from regular test runs
      use: { ...devices['Pixel 5'] },
    },
    
    /* Visual testing projects */
    {
      name: 'Visual Tests - Mobile',
      testMatch: ['**/visual*.spec.ts'],
      use: { 
        ...devices['Pixel 5'],
        /* Ensure consistent visual testing environment */
        colorScheme: 'light',
        reducedMotion: 'reduce',
        forcedColors: 'none',
        /* Additional visual testing settings */
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    },
    
    {
      name: 'Visual Tests - Desktop',
      testMatch: ['**/visual*.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        /* Ensure consistent visual testing environment */
        colorScheme: 'light',
        reducedMotion: 'reduce',
        forcedColors: 'none',
        /* Additional visual testing settings */
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    }
  ],

  /* Run the dev server before starting the tests */
  webServer: {
    command: 'npm start',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_TEST_MODE: 'true'
    }
  },
});