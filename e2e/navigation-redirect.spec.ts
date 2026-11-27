import { expect, test } from '@playwright/test';
import { createPlayer, PASSWORD } from './support/api';

/**
 * Redirecionamentos do roteador (React Router): depois do login, o jogador volta para a página
 * protegida que tentou abrir, sempre no próprio site. Caminhos com barra invertida (variação de
 * redirecionamento aberto, GHSA-wrjc-x8rr-h8h6) não levam a outro domínio.
 */
test.describe('Navegação — redirecionamentos internos', () => {
  test('após o login, volta à página protegida solicitada, no mesmo site', async ({
    page,
    request,
    baseURL,
  }) => {
    const player = await createPlayer(request);
    await page.goto('/historico');
    await expect(page).toHaveURL(/\/login$/);
    await page.getByTestId('login-email').fill(player.email);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('history-page')).toBeVisible();
    expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
  });

  for (const path of ['/%5C%5Cexample.com', '/%5Cexample.com', '/%5C/example.com']) {
    test(`caminho com barra invertida permanece no site (${path})`, async ({ page, baseURL }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
    });
  }
});
