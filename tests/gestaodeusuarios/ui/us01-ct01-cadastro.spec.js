const { test, expect } = require('@playwright/test');

test('US01-CT01 - Cadastro válido pela interface', async ({ page }) => {
  const email = `detetive.${Date.now()}@example.com`;

  await page.goto('/cadastro');

  await page.getByTestId('register-name').fill('Ana Silva');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill('SenhaTest123');
  await page.getByTestId('register-password-confirmation').fill('SenhaTest123');

  await page.getByTestId('register-submit').click();

  await expect(page.getByTestId('current-user-name')).toBeVisible();
  await expect(page.getByTestId('current-user-name')).toContainText('Ana Silva');
});
