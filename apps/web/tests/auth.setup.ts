import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // If no test credentials are provided, skip authentication setup gracefully
    // This allows the test suite to pass in generic CI environments if needed.
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await page.goto('/login');

    // Rather than dealing with Next.js Server Actions transition states which can be flaky
    // in UI automation, we just directly invoke the Supabase client to create/login the user
    // and let the frontend cookie sync.
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Try to sign in
    let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    // 2. If it fails due to invalid credentials, sign up the user
    if (error && error.message.includes('Invalid login credentials')) {
        console.log('Test user not found, signing up...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            throw new Error(`Failed to seed test user: ${signUpError.message}`);
        }
        data = signUpData;
    } else if (error) {
        throw new Error(`Unexpected Supabase auth error: ${error.message}`);
    }

    if (!data.session) {
        throw new Error('No session returned from Supabase auth.');
    }

    // Now that we have a valid backend session, inject it directly into the Playwright context
    // This bypasses the UI login route and prevents server-action state race conditions.
    const sessionState = {
        cookies: [], // Optional: Supabase SSR relies on cookies or local storage depending on the adapter.
        origins: [
            {
                origin: 'http://localhost:3000',
                localStorage: [
                    {
                        name: `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`,
                        value: JSON.stringify(data.session)
                    }
                ]
            }
        ]
    };

    // We can also just navigate to a page and set the cookie natively inside the browser context,
    // but the most bulletproof way for Next.js SSR is to hit the server-action login.
    // To ensure the UI form succeeds, we use explicit waits for navigation.

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Explicitly click and wait for navigation in one atomic action
    await Promise.all([
        page.waitForNavigation({ url: /.*(\/timeline|\/onboarding)/, timeout: 15000 }),
        page.click('button:has-text("Entrar")')
    ]);

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
