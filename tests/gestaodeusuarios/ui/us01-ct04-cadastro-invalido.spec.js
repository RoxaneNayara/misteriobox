
const { test, expect } = require('@playwright/test');

test.describe('US01-CT04 - Cadastro com dados inválidos', () => {

    test('Deve impedir cadastro com nome inválido', async ({ page }) => {
        await page.goto('/cadastro');

        await page.getByTestId('register-name').fill('Ana123');
        await page.getByTestId('register-email').fill('ana.nome@example.com');
        await page.getByTestId('register-password').fill('SenhaTeste123');
        await page.getByTestId('register-password-confirmation').fill('SenhaTeste123');

        await page.getByTestId('register-submit').click();

        await expect(
            page.getByTestId('register-name-error')
        ).toHaveText(
            'Use apenas letras (com ou sem acento), espaços, hífens ou apóstrofos, começando e terminando com letra.'
        );

        await expect(page).toHaveURL(/\/cadastro$/);
    });

    test('Deve impedir cadastro com e-mail inválido', async ({ page }) => {
        await page.goto('/cadastro');

        await page.getByTestId('register-name').fill('Ana Silva');
        await page.getByTestId('register-email').fill('email-invalido');
        await page.getByTestId('register-password').fill('SenhaTeste123');
        await page.getByTestId('register-password-confirmation').fill('SenhaTeste123');

        await page.getByTestId('register-submit').click();

        await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();

        await expect(page).toHaveURL(/\/cadastro$/);
    });

    test('Deve impedir cadastro com senha inválida', async ({ page }) => {
        await page.goto('/cadastro');

        await page.getByTestId('register-name').fill('Ana Silva');
        await page.getByTestId('register-email').fill('ana.senha@example.com');
        await page.getByTestId('register-password').fill('123');
        await page.getByTestId('register-password-confirmation').fill('123');

        await page.getByTestId('register-submit').click();

        await expect(
            page.getByTestId('register-password-error')
        ).toHaveText('A senha deve ter pelo menos 8 caracteres.');

        await expect(page).toHaveURL(/\/cadastro$/);
    });

});
