import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const PASSWORD = 'Detetive2026';

export interface TestPlayer {
  email: string;
  token: string;
  expiresIn: number;
  idleTimeoutSeconds: number;
}

let sequence = 0;

/** Cadastra um jogador novo pela API (via proxy do site). */
export async function createPlayer(
  request: APIRequestContext,
  name = 'Detetive Teste',
): Promise<TestPlayer> {
  sequence += 1;
  const email = `e2e.${Date.now()}.${sequence}@example.com`;
  const response = await request.post('/api/auth/register', {
    data: { name, email, password: PASSWORD },
  });
  expect(response.status()).toBe(201);
  const { data } = await response.json();
  return {
    email,
    token: data.token,
    expiresIn: data.expiresIn,
    idleTimeoutSeconds: data.idleTimeoutSeconds,
  };
}

/** Inicia uma investigação e analisa a primeira evidência, para haver progresso salvo. */
export async function startInvestigation(
  request: APIRequestContext,
  player: TestPlayer,
  missionId = 'missao-001',
): Promise<string> {
  const headers = { Authorization: `Bearer ${player.token}` };
  const started = await request.post('/api/investigations', { headers, data: { missionId } });
  expect(started.status()).toBe(201);
  const { data } = await started.json();
  const analyzed = await request.post(`/api/investigations/${data.id}/evidences/ev-01/analysis`, {
    headers,
  });
  expect(analyzed.status()).toBe(200);
  return data.id as string;
}

/** Entra pela tela de login, como o jogador faria. */
export async function loginThroughUi(page: Page, player: TestPlayer): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(player.email);
  await page.getByTestId('login-password').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('current-user-name')).toBeVisible();
}

/** Grava a sessão no navegador antes de a página carregar (sem passar pelo login). */
export async function restoreSession(page: Page, player: TestPlayer): Promise<void> {
  await page.addInitScript((session) => {
    if (localStorage.getItem('misteriobox.token')) return;
    const now = Date.now();
    localStorage.setItem('misteriobox.token', session.token);
    localStorage.setItem('misteriobox.tokenExpiresAt', String(now + session.expiresIn * 1000));
    localStorage.setItem('misteriobox.idleTimeoutMs', String(session.idleTimeoutSeconds * 1000));
    localStorage.setItem('misteriobox.lastActivityAt', String(now));
  }, player);
}
