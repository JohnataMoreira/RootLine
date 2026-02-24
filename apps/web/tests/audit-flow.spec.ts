import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test.describe('Simulação de Auditoria (E2E Journey)', () => {

    test('Fluxo completo do usuário (Signup -> Familia -> Timeline -> Tree -> Profile -> Logout)', async ({ page }) => {
        // Usa o App URL do ambiente ou local
        const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

        // 1. Criar conta (Signup)
        const testEmail = `audit_${crypto.randomBytes(4).toString('hex')}@example.com`;
        const testPassword = 'Password123!';

        console.log(`[Audit] Iniciando teste com email: ${testEmail}`);

        await page.goto(`${baseURL}/login`);

        // Preenche o formulário
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', testPassword);

        // Clica em Criar Conta (agora traduzido)
        await page.click('button:has-text("Criar Conta")');

        console.log('[Audit] Aguardando redirecionamento para Onboarding...');
        await page.waitForURL('**/onboarding', { timeout: 15000 });
        await expect(page.locator('text=Preserve o legado da sua família')).toBeVisible();

        // 2. Onboarding (Criar Família)
        console.log('[Audit] Preenchendo Onboarding...');
        await page.fill('input[name="familyName"]', 'Família Auditoria E2E');
        await page.click('button:has-text("Começar agora")');

        console.log('[Audit] Aguardando redirecionamento para Timeline...');
        await page.waitForURL('**/timeline', { timeout: 15000 });
        await expect(page.locator('h1', { hasText: 'Linha do Tempo' })).toBeVisible();

        // 3. Navegação: Árvore Genealógica
        console.log('[Audit] Navegando para a Árvore...');
        // O BottomNav usa âncoras para navegação
        await page.click('a[href="/tree"]');
        await page.waitForURL('**/tree', { timeout: 10000 });
        await expect(page.locator('h2', { hasText: 'Nossa Árvore' })).toBeVisible();

        // 4. Navegação: Perfil
        console.log('[Audit] Navegando para o Perfil...');
        await page.click('a[href="/profile"]');
        await page.waitForURL('**/profile', { timeout: 10000 });
        await expect(page.locator('h1', { hasText: 'Meu Perfil' })).toBeVisible();

        // 5. Logout
        console.log('[Audit] Testando Logout...');
        await page.click('button:has-text("Sair da Conta")');
        await page.waitForURL('**/login', { timeout: 10000 });
        await expect(page.locator('text=Acesse o arquivo da sua família')).toBeVisible();

        console.log('[Audit] Sucesso! Todo o fluxo principal foi validado sem quebras.');
    });
});
