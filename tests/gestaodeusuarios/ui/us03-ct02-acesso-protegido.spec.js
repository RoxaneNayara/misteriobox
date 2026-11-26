const { test, expect } = require('@playwright/test');

test.describe('US03-CT02 - Proteção de páginas', () => {
  test('Deve impedir acesso sem autenticação', async ({ page }) => {
    await page.goto('/historico');

    await expect(page).toHaveURL(/\/login$/);

    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('Deve exigir novo login após logout', async ({ page, request }) => {
    const email = `sessao.${Date.now()}@example.com`;
    const senha = 'SenhaTeste123';

    // Preparação: cadastrar jogador
    const cadastro = await request.post('/api/auth/register', {
      data: {
        name: 'Ana Silva',
        email: email,
        password: senha,
      },
    });

    expect(cadastro.status()).toBe(201);

    await page.goto('/login');

    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(senha);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('current-user-name')).toBeVisible();

    // Acessar página protegida
    await page.goto('/historico');

    await expect(page).toHaveURL(/\/historico$/);

    // Encerrar a sessão
    await page.getByTestId('logout-button').click();

    await expect(page).toHaveURL(/\/login$/);

    // Tentar acessar novamente
    await page.goto('/historico');

    await expect(page).toHaveURL(/\/login$/);

    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
