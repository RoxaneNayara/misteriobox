import { expect, test, type Page } from '@playwright/test';
import { createPlayer, restoreSession, type TestPlayer } from './support/api';

/**
 * Notificações de sucesso da investigação (toasts), exibidas logo abaixo do menu da investigação.
 * O relógio do navegador é controlado (page.clock): a contagem de ~4 s não depende
 * da velocidade da máquina, e o teste avança o tempo de forma explícita.
 */
const TOAST_MS = 4_000;
const toast = (page: Page) => page.getByTestId('investigation-feedback-message');

/** Inicia uma missão (padrão: 001, com ev-01, ev-02 e ev-03 livres desde o início). */
async function openFreshInvestigation(
  page: Page,
  player: TestPlayer,
  viewport = { width: 1280, height: 800 },
  missionId = 'missao-001',
) {
  const started = await page.request.post('/api/investigations', {
    headers: { Authorization: `Bearer ${player.token}` },
    data: { missionId },
  });
  expect(started.status()).toBe(201);
  const { data } = await started.json();
  await page.setViewportSize(viewport);
  await restoreSession(page, player);
  await page.clock.install();
  await page.goto(`/investigacoes/${data.id}`);
  await expect(page.getByTestId('investigation-title')).toBeVisible();
  return data.id as string;
}

async function progressFromApi(page: Page, player: TestPlayer, investigationId: string) {
  const response = await page.request.get(`/api/investigations/${investigationId}`, {
    headers: { Authorization: `Bearer ${player.token}` },
  });
  return (await response.json()).data as {
    progress: { analyzedEvidences: number };
    hints: { used: unknown[] };
  };
}

test.describe('Notificações da investigação', () => {
  test('revelar uma dica: a mensagem aparece e some sozinha após ~4 s', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await openFreshInvestigation(page, player);

    await page.getByTestId('hint-request').click();
    await page.getByTestId('hint-dialog-confirm').click();
    await expect(toast(page)).toHaveText(/Nova dica revelada\. Progresso salvo\./);
    await expect(page.getByTestId('hint-list').locator('li')).toHaveCount(1);

    await page.clock.runFor(TOAST_MS - 500);
    await expect(toast(page)).toBeVisible();
    await page.clock.runFor(600);
    await expect(toast(page)).toHaveCount(0);

    // A dica revelada continua registrada (regra das dicas preservada).
    expect((await progressFromApi(page, player, investigationId)).hints.used).toHaveLength(1);
  });

  test('analisar uma evidência: a mensagem aparece e some sozinha após ~4 s', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    await openFreshInvestigation(page, player);

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toHaveText(/Evidência ".+" analisada\. Progresso salvo\./);
    await page.clock.runFor(TOAST_MS - 500);
    await expect(toast(page)).toBeVisible();
    await page.clock.runFor(600);
    await expect(toast(page)).toHaveCount(0);
  });

  test('ações consecutivas substituem a mensagem e reiniciam o temporizador', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    await openFreshInvestigation(page, player);

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toContainText('Relatório técnico do apagão');

    await page.clock.runFor(3_000);
    await page.getByTestId('evidence-analyze-ev-02').click();
    await expect(toast(page)).toContainText('Programa da noite de estreia');
    await expect(toast(page)).toHaveCount(1);
    await expect(toast(page)).not.toContainText('Relatório técnico do apagão');

    // 3 s + 1,5 s depois da primeira ação: ainda visível, porque o tempo recomeçou.
    await page.clock.runFor(1_500);
    await expect(toast(page)).toBeVisible();
    await page.clock.runFor(TOAST_MS - 1_500 + 100);
    await expect(toast(page)).toHaveCount(0);
  });

  test('não fica presa ao trocar de seção nem ao sair para o catálogo', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await openFreshInvestigation(page, player);

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toBeVisible();

    // Troca de seção com a mensagem visível: ela continua fora do fluxo e expira.
    await page.getByTestId('case-nav-secao-suspeitos').click();
    await expect(page.getByTestId('case-nav-secao-suspeitos')).toHaveAttribute(
      'aria-current',
      'location',
    );
    await page.clock.runFor(TOAST_MS + 100);
    await expect(toast(page)).toHaveCount(0);

    // Nova mensagem e saída para o catálogo: nada acompanha a navegação.
    await page.getByTestId('evidence-analyze-ev-02').click();
    await expect(toast(page)).toBeVisible();
    await page.getByTestId('investigation-exit').click();
    await expect(page.getByTestId('mission-list')).toBeVisible();
    await expect(page.getByTestId('investigation-feedback')).toHaveCount(0);

    // De volta à investigação, nenhuma mensagem antiga reaparece.
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('investigation-title')).toBeVisible();
    await expect(toast(page)).toHaveCount(0);
  });

  /** Posição da notificação em relação ao menu da investigação, ao cabeçalho e ao "Voltar ao topo". */
  async function toastLayout(page: Page) {
    // Mede a posição final: espera a animação de entrada terminar (sem tempo fixo).
    await toast(page).evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    );
    return page.evaluate(() => {
      const box = document
        .querySelector('[data-testid="investigation-feedback-message"]')!
        .getBoundingClientRect();
      const nav = document.querySelector('[data-testid="case-nav"]')!.getBoundingClientRect();
      const header = document.querySelector('.app-header')!.getBoundingClientRect();
      const backToTop = document
        .querySelector('[data-testid="back-to-top"]')
        ?.getBoundingClientRect();
      const overlaps = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return {
        // Logo abaixo do menu: começa depois dele, com uma folga pequena.
        belowMenu: box.top >= nav.bottom - 1 && box.top - nav.bottom <= 16,
        coversMenu: overlaps(box, nav),
        coversHeader: header.bottom > 0 && overlaps(box, header),
        overlapsBackToTop: backToTop ? overlaps(box, backToTop) : false,
        insideViewport: box.left >= 0 && box.right <= window.innerWidth && box.top >= 0,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        probe: { x: box.left + box.width / 2, y: box.top + box.height / 2 },
      };
    });
  }

  const EXPECTED_LAYOUT = {
    belowMenu: true,
    coversMenu: false,
    coversHeader: false,
    overlapsBackToTop: false,
    insideViewport: true,
    pageOverflow: 0,
  };

  for (const width of [320, 390, 768, 1280]) {
    test(`em ${width}px aparece logo abaixo do menu, sem cobri-lo, e acompanha a rolagem`, async ({
      page,
      request,
    }) => {
      const player = await createPlayer(request);
      await openFreshInvestigation(page, player, { width, height: 760 });

      await page.getByTestId('evidence-analyze-ev-01').click();
      await expect(toast(page)).toBeVisible();
      expect(await toastLayout(page)).toMatchObject(EXPECTED_LAYOUT);

      // Com o menu fixo no topo e o "Voltar ao topo" visível, continua logo abaixo do menu
      // e independente do botão.
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
      await expect(page.getByTestId('back-to-top')).toBeVisible();
      const scrolled = await toastLayout(page);
      expect(scrolled).toMatchObject(EXPECTED_LAYOUT);

      // Depois de expirar, o ponto que a mensagem ocupava volta a ser do conteúdo.
      await page.clock.runFor(TOAST_MS + 100);
      await expect(toast(page)).toHaveCount(0);
      const topmost = await page.evaluate(
        ({ x, y }) =>
          document.elementFromPoint(x, y)?.closest('[data-testid="investigation-feedback"]'),
        scrolled.probe,
      );
      expect(topmost).toBeNull();
      await expect(page.getByTestId('back-to-top')).toBeVisible();
    });
  }

  test('no topo da página (menu ainda no fluxo), aparece abaixo do menu sem deslocar o conteúdo', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    await openFreshInvestigation(page, player, { width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    // Distância entre o menu e a primeira seção: só muda se a notificação ocupar espaço no fluxo.
    // (A análise também atualiza o cabeçalho do caso, que pode mudar de altura.)
    const sectionTop = () =>
      page.evaluate(
        () =>
          document.getElementById('secao-caso')!.getBoundingClientRect().top -
          document.querySelector('[data-testid="case-nav"]')!.getBoundingClientRect().bottom,
      );
    const before = await sectionTop();

    // Dispara a ação sem rolar a página (clique programático no botão).
    await page.evaluate(() =>
      (
        document.querySelector('[data-testid="evidence-analyze-ev-01"]') as HTMLButtonElement
      ).click(),
    );
    await expect(toast(page)).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await toastLayout(page)).toMatchObject(EXPECTED_LAYOUT);
    // A notificação fica sobreposta, fora do fluxo: o conteúdo não se move.
    expect(await sectionTop()).toBe(before);
  });

  test('é anunciada por região viva, sem tirar o foco, e pode ser fechada pelo teclado', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    await openFreshInvestigation(page, player);

    // A região viva já existe antes da primeira mensagem.
    const region = page.getByTestId('investigation-feedback');
    await expect(region).toHaveAttribute('role', 'status');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toBeEmpty();

    // Ação feita pelo teclado: o foco não é levado para a notificação.
    await page.getByTestId('evidence-analyze-ev-01').focus();
    await page.keyboard.press('Enter');
    await expect(region).toContainText('Progresso salvo.');
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('[data-testid="investigation-feedback"]'),
      ),
    ).toBe(false);

    // O botão de fechar é acessível por nome e funciona pelo teclado.
    const close = page.getByRole('button', { name: 'Fechar notificação' });
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(toast(page)).toHaveCount(0);
  });

  test('respeita a preferência de movimento reduzido', async ({ page, request }) => {
    const player = await createPlayer(request);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openFreshInvestigation(page, player);

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toBeVisible();
    const animation = await toast(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return { name: style.animationName, duration: parseFloat(style.animationDuration) };
    });
    expect(animation.name === 'none' || animation.duration <= 0.001).toBe(true);
  });

  test('o progresso continua salvo depois que a mensagem some', async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await openFreshInvestigation(page, player);

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toBeVisible();
    await page.getByTestId('hint-request').click();
    await page.getByTestId('hint-dialog-confirm').click();
    await expect(toast(page)).toHaveText(/Nova dica revelada/);
    await page.clock.runFor(TOAST_MS + 100);
    await expect(toast(page)).toHaveCount(0);

    await expect(page.getByTestId('investigation-progress')).toContainText('1 de 5');
    const saved = await progressFromApi(page, player, investigationId);
    expect(saved.progress.analyzedEvidences).toBe(1);
    expect(saved.hints.used).toHaveLength(1);

    // Recarregar a página (ou entrar de novo) mostra o mesmo progresso.
    await page.reload();
    await expect(page.getByTestId('investigation-progress')).toContainText('1 de 5');
    await expect(page.getByTestId('evidence-state-ev-01')).toContainText(/analisada/i);
  });
  test('caso relatado no reteste (missão 005): a mensagem some e não bloqueia a investigação', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    await openFreshInvestigation(page, player, { width: 390, height: 844 }, 'missao-005');

    await page.getByTestId('evidence-analyze-ev-01').click();
    await expect(toast(page)).toHaveText(
      'Evidência "Planilha de notas do júri" analisada. Progresso salvo.',
    );

    // Com a mensagem visível, a investigação continua utilizável: outra evidência,
    // a troca de seção e a dica respondem normalmente.
    await page.getByTestId('evidence-analyze-ev-02').click();
    await expect(page.getByTestId('evidence-state-ev-02')).toContainText(/analisada/i);
    await page.getByTestId('case-nav-secao-dicas').click();
    await page.getByTestId('hint-request').click();
    await page.getByTestId('hint-dialog-confirm').click();
    await expect(toast(page)).toHaveText('Nova dica revelada. Progresso salvo.');
    await expect(toast(page)).toHaveCount(1);

    // A faixa da região fora do cartão não intercepta cliques.
    const blocksOutsideCard = await page.evaluate(() => {
      const region = document.querySelector('[data-testid="investigation-feedback"]')!;
      return getComputedStyle(region).pointerEvents !== 'none';
    });
    expect(blocksOutsideCard).toBe(false);

    await page.clock.runFor(TOAST_MS + 100);
    await expect(toast(page)).toHaveCount(0);
  });
});
