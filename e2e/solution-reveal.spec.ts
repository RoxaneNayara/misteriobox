import { expect, test, type APIRequestContext } from '@playwright/test';
import { createPlayer, restoreSession, type TestPlayer } from './support/api';

/**
 * Relatório final: a solução só aparece com 50 pontos ou mais.
 * Partidas reais da missão 001 pela API (culpada: Clara Monteiro; evidência decisiva: ev-04,
 * que exige ev-01; 2 dicas disponíveis). Nenhuma pontuação é injetada.
 */
interface Accusation {
  suspectId: string;
  evidenceId: string;
  hints: number;
}

async function finishMission001(
  request: APIRequestContext,
  player: TestPlayer,
  { suspectId, evidenceId, hints }: Accusation,
) {
  const headers = { Authorization: `Bearer ${player.token}` };
  const started = await request.post('/api/investigations', {
    headers,
    data: { missionId: 'missao-001' },
  });
  const { data } = await started.json();
  for (let hint = 0; hint < hints; hint += 1) {
    expect((await request.post(`/api/investigations/${data.id}/hints`, { headers })).status()).toBe(
      200,
    );
  }
  for (const evidence of ['ev-01', 'ev-02', 'ev-03', 'ev-04']) {
    const analyzed = await request.post(
      `/api/investigations/${data.id}/evidences/${evidence}/analysis`,
      { headers },
    );
    expect(analyzed.status()).toBe(200);
  }
  const accused = await request.post(`/api/investigations/${data.id}/accusation`, {
    headers,
    data: { suspectId, evidenceId },
  });
  expect(accused.status()).toBe(200);
  return data.id as string;
}

test.describe('Relatório final — revelação da solução', () => {
  test('0 ponto: mostra a pontuação, mas mantém a solução lacrada', async ({ page, request }) => {
    const player = await createPlayer(request);
    const id = await finishMission001(request, player, {
      suspectId: 'helena-duarte',
      evidenceId: 'ev-02',
      hints: 0,
    });
    await restoreSession(page, player);
    await page.goto(`/investigacoes/${id}/resultado`);

    await expect(page.getByTestId('result-score')).toContainText('0');
    await expect(page.getByTestId('result-classification')).toContainText(
      'Investigação Inconclusiva',
    );
    const locked = page.getByTestId('result-solution-locked');
    await expect(locked).toContainText(
      'não alcançou a pontuação necessária para revelar a verdade',
    );
    await expect(locked).toContainText('50 pontos ou mais');
    await expect(page.getByTestId('result-solution')).toHaveCount(0);
    await expect(page.getByTestId('result-culprit')).toHaveCount(0);
    await expect(page.getByText('Clara Monteiro')).toHaveCount(0);
  });

  test('50 pontos (limite): revela o culpado, a evidência decisiva e a explicação', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const id = await finishMission001(request, player, {
      suspectId: 'clara-monteiro',
      evidenceId: 'ev-02',
      hints: 2,
    });
    await restoreSession(page, player);
    await page.goto(`/investigacoes/${id}/resultado`);

    await expect(page.getByTestId('result-score')).toContainText('50');
    await expect(page.getByTestId('result-solution')).toBeVisible();
    await expect(page.getByTestId('result-culprit')).toHaveText('Clara Monteiro');
    await expect(page.getByTestId('result-decisive-evidence')).toHaveText(
      'Registro de crachás da sala de segurança',
    );
    await expect(page.getByTestId('result-explanation')).toContainText('Clara Monteiro');
    await expect(page.getByTestId('result-solution-locked')).toHaveCount(0);
  });

  test('100 pontos: revela a solução completa', async ({ page, request }) => {
    const player = await createPlayer(request);
    const id = await finishMission001(request, player, {
      suspectId: 'clara-monteiro',
      evidenceId: 'ev-04',
      hints: 0,
    });
    await restoreSession(page, player);
    await page.goto(`/investigacoes/${id}/resultado`);

    await expect(page.getByTestId('result-score')).toContainText('100');
    await expect(page.getByTestId('result-solution')).toBeVisible();
    await expect(page.getByTestId('result-solution-locked')).toHaveCount(0);
  });
});
