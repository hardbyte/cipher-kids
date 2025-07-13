import { test as baseTest, BrowserContext, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const test = baseTest.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    
    // Inject localStorage before any page loads - this ensures authentication
    // is set up before React initializes, preventing race conditions
    await context.addInitScript((authData) => {
      // Set authentication data in localStorage before React app initializes
      window.localStorage.setItem('cipher-app-user', authData.userId);
      window.localStorage.setItem('cipher-app-enabled-ciphers', JSON.stringify(authData.enabledCiphers));
      window.localStorage.setItem(`cipher-app-user-config-${authData.userId}`, JSON.stringify(authData.userConfig));
    }, {
      userId: 'A',
      enabledCiphers: ['atbash', 'caesar', 'keyword', 'railfence', 'vigenere'],
      userConfig: { theme: 'dark' }
    });
    
    await use(context);
    await context.close();
  },
  
  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
  }
});

export { expect } from '@playwright/test';