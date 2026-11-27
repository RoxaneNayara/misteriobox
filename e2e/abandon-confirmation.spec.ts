import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { createPlayer, restoreSession, startInvestigation, type TestPlayer } from './support/api';

/**
 * RN07 — abandono voluntário com confirmação. Cancelar (botão ou Esc) não envia nada à API e a
 * investigação continua em andamento; confirmar encerra como ABANDONADO, sem retomada.
 */
async function statusOnApi(request: APIRequestContext, player: TestPlayer, id: string) {
  const response = await request.get(`/api/investigations/${id}`, {
    headers: { Authorization: `Bearer ${player.token}` },
  });
  return (await response.json()).data.status as string;
}

async function openAbandonDialog(page: Page, id: string) {
  await page.goto(`/investigacoes/${id}`);
  await expect(page.getByTestId('investigation-title')).toBeVisible();
  await page.getByTestId('investigation-abandon').click();
  await expect(page.getByTestId('abandon-dialog')).toBeVisible();
}

test.describe('Abandono da investigação — confirmação', () => {
  let player: TestPlayer;
  let investigationId: string;
  let abandonRequests: string[];

  test.beforeEach(async ({ page, request }) => {
    player = await createPlayer(request);
    investigationId = await startInvestigation(request, player);
    await restoreSession(page, player);
    abandonRequests = [];
    page.on('request', (sent) => {
      if (sent.method() === 'POST' && sent.url().endsWith('/abandon'))
        abandonRequests.push(sent.url());
    });
  });

  test('"Continuar investigando" fecha o diálogo sem alterar a investigação', async ({
    page,
    request,
  }) => {
    await openAbandonDialog(page, investigationId);
    await page.getByTestId('abandon-dialog-cancel').click();

    await expect(page.getByTestId('abandon-dialog')).toBeHidden();
    await expect(page.getByTestId('investigation-abandon')).toBeFocused();
    await expect(page.getByTestId('investigation-status')).toHaveText(/em andamento/i);
    expect(abandonRequests).toHaveLength(0);
    expect(await statusOnApi(request, player, investigationId)).toBe('EM_ANDAMENTO');
  });

  test('Esc cancela da mesma forma', async ({ page, request }) => {
    await openAbandonDialog(page, investigationId);
    await page.keyboard.press('Escape');

    await expect(page.getByTestId('abandon-dialog')).toBeHidden();
    expect(abandonRequests).toHaveLength(0);
    expect(await statusOnApi(request, player, investigationId)).toBe('EM_ANDAMENTO');
  });

  test('confirmar encerra como ABANDONADO e a investigação não aceita novas ações', async ({
    page,
    request,
  }) => {
    await openAbandonDialog(page, investigationId);
    await page.getByTestId('abandon-dialog-confirm').click();

    await expect.poll(() => statusOnApi(request, player, investigationId)).toBe('ABANDONADO');
    expect(abandonRequests).toHaveLength(1);
    const hint = await request.post(`/api/investigations/${investigationId}/hints`, {
      headers: { Authorization: `Bearer ${player.token}` },
    });
    expect(hint.status()).toBe(409);
  });
});
