const { test, expect } = require('@playwright/test');

test('US02-CT01 - Login com credenciais válidas pela interface', async ({ page, request }) => {
  const email = `login.ui${Date.now()}@example.com`;
  const senha = 'SenhaTeste123';

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
  await expect(page.getByTestId('current-user-name')).toContainText('Ana Silva');
  await expect(page).not.toHaveURL(/\/login$/);
});
