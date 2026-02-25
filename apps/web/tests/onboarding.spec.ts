import { test, expect } from '@playwright/test'

// Clear global auth state so this test always runs clean
test.use({ storageState: { cookies: [], origins: [] } })

test.describe.serial('Onboarding Flow', () => {
    const familyName = `[E2E] Test Family ${Date.now()}`
    const testEmail = `onboarding-${Date.now()}@example.com`
    const testPassword = 'password123'

    test('successfully creates a new family and redirects to timeline', async ({ page }) => {
        // 1. Sign up a fresh user via Supabase JS to bypass UI form flakiness
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        })
        expect(error).toBeNull()

        // 2. Log in via UI to set the cookie natively and trigger redirect to /onboarding
        await page.goto('/login')
        await page.fill('input[name="email"]', testEmail)
        await page.fill('input[name="password"]', testPassword)
        await Promise.all([
            page.waitForNavigation({ url: /.*\/onboarding/, timeout: 15000 }),
            page.click('button:has-text("Entrar")')
        ])

        // 3. Wait for onboarding page to load using the robust test-id
        await page.goto('/onboarding');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);
        await expect(page.locator('input:not([type="hidden"])').first()).toBeVisible({ timeout: 15000 });// 4. Fill out the "Create New Family" form
        const nameInput = page.locator('input[name="familyName"]')
        await nameInput.fill(familyName)

        // 5. Submit ("Começar agora" is the localized string)
        await page.locator('button', { hasText: 'Começar agora' }).click()

        // 6. Verify redirect to timeline
        await expect(page).toHaveURL(/.*\/timeline/, { timeout: 15000 })
        await expect(page.getByRole('heading', { name: 'Linha do Tempo' })).toBeVisible()

        // 7. Open family selector to verify it was active and added
        await page.goto('/families')
        await expect(page.getByText(familyName)).toBeVisible({ timeout: 15000 })
    })
})


