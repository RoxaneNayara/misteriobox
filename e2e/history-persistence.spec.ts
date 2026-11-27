import { expect, test } from '@playwright/test';
import { createPlayer, loginThroughUi, startInvestigation } from './support/api';

/**
 * Histórico do jogador: a página não afirma que os registros duram só enquanto o servidor
 * estiver em execução (em Production e Preview o banco é o MongoDB Atlas, persistente) e a
 * tentativa continua listada depois de sair e entrar novamente.
 */
test.describe('Meu histórico — persistência', () => {
  test('texto da página e tentativa preservada após logout e novo login', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await loginThroughUi(page, player);
    await page.getByTestId('nav-history').click();
    const historyPage = page.getByTestId('history-page');
    await expect(historyPage).toContainText('vinculados à sua conta');
    await expect(historyPage).not.toContainText(/enquanto o servidor|em memória|temporári/i);
    await expect(page.getByTestId(`history-item-${investigationId}`)).toBeVisible();

    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
    await loginThroughUi(page, player);
    await page.getByTestId('nav-history').click();
    await expect(page.getByTestId(`history-item-${investigationId}`)).toBeVisible();
  });
});
