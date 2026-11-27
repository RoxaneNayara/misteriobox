import { expect, test } from '@playwright/test';
import { createPlayer, loginThroughUi, PASSWORD, startInvestigation } from './support/api';

/**
 * B04 — Sessão, inatividade e logout (US03-CT02).
 * Logout e expiração nunca abandonam a investigação (RN06).
 */
test.describe('B04 — sessão e inatividade', () => {
  test('expira após 30 min sem atividade e retoma a investigação após novo login', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await page.clock.install();
    await loginThroughUi(page, player);
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('investigation-title')).toBeVisible();
    await expect(page.getByTestId('investigation-progress')).toContainText('1 de 5');

    await page.clock.fastForward('31:00');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('session-expired-message')).toBeVisible();
    await expect(page.getByTestId('investigation-title')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('misteriobox.token'))).toBeNull();

    // Novo login volta para a investigação, com o progresso preservado.
    await page.getByTestId('login-email').fill(player.email);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(new RegExp(`/investigacoes/${investigationId}$`));
    await expect(page.getByTestId('investigation-status')).toContainText('Em andamento');
    await expect(page.getByTestId('investigation-progress')).toContainText('1 de 5');
  });

  test('continua autenticado enquanto há atividade antes de 30 min', async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await page.clock.install();
    await loginThroughUi(page, player);
    await page.goto(`/investigacoes/${investigationId}`);
    // O monitor de sessão começa a contar quando a página autenticada termina de carregar;
    // o relógio só pode avançar depois disso.
    await expect(page.getByTestId('investigation-title')).toBeVisible();

    const lastActivity = () =>
      page.evaluate(() => Number(localStorage.getItem('misteriobox.lastActivityAt')));
    const tokenExpiresAt = () =>
      page.evaluate(() => Number(localStorage.getItem('misteriobox.tokenExpiresAt')));

    // 3 × 20 min = 60 min no total, mas nunca 30 min seguidos sem atividade.
    for (let round = 0; round < 3; round += 1) {
      await page.clock.fastForward('20:00');
      const before = await lastActivity();
      const expiresBefore = await tokenExpiresAt();
      // A atividade renova o token (POST /api/auth/refresh). O relógio simulado só pode
      // avançar de novo depois que a renovação terminar; antes disso o token antigo
      // continua valendo apenas até 30 min, como no servidor.
      const refreshed = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/auth/refresh') && response.request().method() === 'POST',
      );
      await page.mouse.move(200, 300);
      await page.mouse.wheel(0, 200);
      // O evento de rolagem é entregue de forma assíncrona: espera ser registrado.
      await expect.poll(lastActivity).toBeGreaterThan(before);
      expect((await refreshed).ok()).toBe(true);
      await expect.poll(tokenExpiresAt).toBeGreaterThan(expiresBefore);
      await expect(page.getByTestId('investigation-title')).toBeVisible();
    }
    await expect(page).toHaveURL(new RegExp(`/investigacoes/${investigationId}$`));
  });

  test('reaberta pelo histórico após a inatividade, a página exige login sem buscar dados protegidos', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await loginThroughUi(page, player);
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('investigation-title')).toBeVisible();

    // O jogador sai do site sem logout; a última atividade fica 31 min no passado.
    await page.evaluate(() =>
      localStorage.setItem('misteriobox.lastActivityAt', String(Date.now() - 31 * 60 * 1000)),
    );
    await page.goto('about:blank');

    const protectedRequests: string[] = [];
    page.on('request', (sentRequest) => {
      const url = sentRequest.url();
      if (url.includes('/api/investigations') || url.includes('/api/auth/me')) {
        protectedRequests.push(url);
      }
    });

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('session-expired-message')).toBeVisible();
    await expect(page.getByTestId('investigation-title')).toHaveCount(0);
    expect(protectedRequests).toEqual([]);
  });

  test('verifica a sessão ao voltar para a aba', async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await loginThroughUi(page, player);
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('investigation-title')).toBeVisible();

    await page.evaluate(() => {
      localStorage.setItem('misteriobox.lastActivityAt', String(Date.now() - 31 * 60 * 1000));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('investigation-title')).toHaveCount(0);
  });

  test('logout encerra a sessão, voltar no histórico não mostra dados e a investigação continua em andamento', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    await loginThroughUi(page, player);
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('investigation-title')).toBeVisible();

    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('logout-message')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('misteriobox.token'))).toBeNull();

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('investigation-title')).toHaveCount(0);

    // RN06: logout não é abandono.
    const relogin = await request.post('/api/auth/login', {
      data: { email: player.email, password: PASSWORD },
    });
    const { data } = await relogin.json();
    const progress = await request.get(`/api/investigations/${investigationId}`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const body = await progress.json();
    expect(body.data.status).toBe('EM_ANDAMENTO');
    expect(body.data.progress.analyzedEvidences).toBe(1);
  });

  test('logout em uma aba encerra a sessão nas outras abas', async ({ context, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player);

    const firstTab = await context.newPage();
    await loginThroughUi(firstTab, player);
    const secondTab = await context.newPage();
    await secondTab.goto(`/investigacoes/${investigationId}`);
    await expect(secondTab.getByTestId('investigation-title')).toBeVisible();

    await firstTab.getByTestId('logout-button').click();
    await expect(secondTab).toHaveURL(/\/login$/);
    await expect(secondTab.getByTestId('investigation-title')).toHaveCount(0);
  });
});
