import { test, expect } from '@playwright/test';

// These tests are currently skipped because /timeline, /tree, and /profile 
// These tests will use the authenticated state configured in auth.setup.ts
// If credentials are not set, it may fall back to the generic unauthenticated view
// (or fail on redirect timeouts depending on the exact env config)
test.describe('Visual Regression Tests (Auth Required)', () => {
    const screens = [
        { name: 'timeline', path: '/timeline' },
        { name: 'tree', path: '/tree' },
        { name: 'profile', path: '/profile' }
    ];

    for (const screen of screens) {
        test(`Visual parity: ${screen.name} (Light Mode)`, async ({ page }) => {
            // Force light mode
            await page.emulateMedia({ colorScheme: 'light' });
            await page.goto(screen.path);

            // Wait for network idle to ensure fonts/images loaded
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`${screen.name}-light.png`, { fullPage: true });
        });

        test(`Visual parity: ${screen.name} (Dark Mode)`, async ({ page }) => {
            // Force dark mode
            await page.emulateMedia({ colorScheme: 'dark' });
            await page.goto(screen.path);

            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot(`${screen.name}-dark.png`, { fullPage: true });
        });
    }
});
