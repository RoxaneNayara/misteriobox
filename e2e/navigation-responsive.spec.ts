import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { createPlayer, restoreSession, startInvestigation, type TestPlayer } from './support/api';

/**
 * Navegação e responsividade (revisão de 26/11):
 * - menu da investigação em uma linha, com rolagem horizontal controlada em telas estreitas;
 * - botão "Voltar ao topo" no catálogo, na investigação e no histórico;
 * - varredura responsiva nas larguras de referência, com nome de jogador longo.
 */
const MOBILE_WIDTHS = [320, 375, 390, 430];
const ALL_WIDTHS = [...MOBILE_WIDTHS, 768, 1280];
const LONG_NAME = 'Maria Eduarda Albuquerque Montenegro Vasconcelos de Andrade Cavalcanti Ferreira';

/** Finaliza uma tentativa da missão 001 com uma acusação (o resultado não importa aqui). */
async function finishInvestigation(request: APIRequestContext, player: TestPlayer) {
  const headers = { Authorization: `Bearer ${player.token}` };
  const started = await request.post('/api/investigations', {
    headers,
    data: { missionId: 'missao-001' },
  });
  expect(started.status()).toBe(201);
  const { data } = await started.json();
  for (const evidenceId of ['ev-01', 'ev-02', 'ev-03']) {
    const analyzed = await request.post(
      `/api/investigations/${data.id}/evidences/${evidenceId}/analysis`,
      { headers },
    );
    expect(analyzed.status()).toBe(200);
  }
  const accused = await request.post(`/api/investigations/${data.id}/accusation`, {
    headers,
    data: { suspectId: 'helena-duarte', evidenceId: 'ev-01' },
  });
  expect(accused.status()).toBe(200);
  return data.id as string;
}

function navReport(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector('[data-testid="case-nav"]') as HTMLElement;
    const list = nav.querySelector('ul') as HTMLElement;
    const links = [...list.querySelectorAll('a')];
    const rows = new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size;
    return {
      rows,
      navHeight: nav.getBoundingClientRect().height,
      listOverflow: list.scrollWidth - list.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      moreStart: nav.classList.contains('case-nav--more-start'),
      moreEnd: nav.classList.contains('case-nav--more-end'),
    };
  });
}

function fullyVisibleInMenu(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((linkSelector) => {
    const list = document.querySelector('[data-testid="case-nav"] ul')!.getBoundingClientRect();
    const link = document.querySelector(linkSelector)?.getBoundingClientRect();
    return (
      !!link &&
      link.left >= list.left - 1 &&
      link.right <= list.right + 1 &&
      link.left >= 0 &&
      link.right <= window.innerWidth
    );
  }, selector);
}

test.describe('Menu da investigação', () => {
  for (const width of ALL_WIDTHS) {
    test(`ocupa uma única linha em ${width}px, sem estourar a página`, async ({
      page,
      request,
    }) => {
      const player = await createPlayer(request);
      const investigationId = await startInvestigation(request, player, 'missao-003');
      await restoreSession(page, player);
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/investigacoes/${investigationId}`);
      await expect(page.getByTestId('case-nav')).toBeVisible();

      const report = await navReport(page);
      expect(report.rows).toBe(1);
      expect(report.navHeight).toBeLessThan(60);
      expect(report.pageOverflow).toBeLessThanOrEqual(0);
      if (width >= 768) {
        // Com espaço, a navegação é horizontal e completa, sem rolagem interna.
        expect(report.listOverflow).toBeLessThanOrEqual(0);
        expect(report).toMatchObject({ moreStart: false, moreEnd: false });
      }
    });
  }

  for (const width of [320, 390]) {
    test(`em ${width}px rola na horizontal, indica a continuação e mantém a seção ativa à vista`, async ({
      page,
      request,
    }) => {
      const player = await createPlayer(request);
      const investigationId = await startInvestigation(request, player, 'missao-003');
      await restoreSession(page, player);
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/investigacoes/${investigationId}`);
      await expect(page.getByTestId('case-nav')).toBeVisible();

      const initial = await navReport(page);
      expect(initial.listOverflow).toBeGreaterThan(0);
      expect(initial).toMatchObject({ moreStart: false, moreEnd: true });

      // A última opção é alcançável: ao escolhê-la, a faixa rola até ela.
      const accusation = page.getByTestId('case-nav-secao-acusacao');
      await accusation.click();
      await expect(accusation).toHaveAttribute('aria-current', 'location');
      await expect
        .poll(() => fullyVisibleInMenu(page, '[data-testid="case-nav-secao-acusacao"]'))
        .toBe(true);
      await expect.poll(async () => (await navReport(page)).moreStart).toBe(true);

      // Ao voltar para a primeira seção, a faixa acompanha.
      const story = page.getByTestId('case-nav-secao-caso');
      await story.click();
      await expect(story).toHaveAttribute('aria-current', 'location');
      await expect
        .poll(() => fullyVisibleInMenu(page, '[data-testid="case-nav-secao-caso"]'))
        .toBe(true);
    });
  }

  test('é navegável pelo teclado: cada opção focada fica inteira à vista', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('case-nav')).toBeVisible();

    await page.getByTestId('case-nav-secao-caso').focus();
    const ids = [
      'secao-caso',
      'secao-suspeitos',
      'secao-evidencias',
      'secao-dicas',
      'secao-acusacao',
    ];
    for (const [index, id] of ids.entries()) {
      if (index > 0) await page.keyboard.press('Tab');
      await expect(page.getByTestId(`case-nav-${id}`)).toBeFocused();
      await expect
        .poll(() => fullyVisibleInMenu(page, `[data-testid="case-nav-${id}"]`))
        .toBe(true);
    }
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('case-nav-secao-acusacao')).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('o menu fixo não encobre um botão focado pelo teclado', async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('case-nav')).toBeVisible();

    const covered = await page.evaluate(async () => {
      const button = [...document.querySelectorAll<HTMLButtonElement>('#secao-evidencias button')]
        .filter((candidate) => !candidate.disabled)
        .at(-1)!;
      // Deixa o botão exatamente sob o menu fixo e então o foca.
      window.scrollTo({ top: button.getBoundingClientRect().top + window.scrollY - 10 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      button.focus();
      await new Promise((resolve) => setTimeout(resolve, 300));
      const nav = document.querySelector('[data-testid="case-nav"]')!.getBoundingClientRect();
      return button.getBoundingClientRect().top < nav.bottom;
    });
    expect(covered).toBe(false);
  });
});

test.describe('Voltar ao topo nas páginas internas', () => {
  async function checkBackToTop(page: Page) {
    const button = page.getByRole('button', { name: 'Voltar ao topo' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(button).toHaveCount(0);

    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    await expect(button).toBeVisible();

    // O botão fica por cima de tudo e não cobre o rodapé.
    const placement = await page.evaluate(() => {
      const box = document.querySelector('[data-testid="back-to-top"]')!.getBoundingClientRect();
      const topmost = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      const footerText = [...document.querySelectorAll('.app-footer p')].map((p) =>
        p.getBoundingClientRect(),
      );
      const overlapsFooter = footerText.some(
        (text) =>
          text.left < box.right &&
          box.left < text.right &&
          text.top < box.bottom &&
          box.top < text.bottom,
      );
      return {
        onTop: !!topmost && !!topmost.closest('[data-testid="back-to-top"]'),
        overlapsFooter,
      };
    });
    expect(placement).toEqual({ onTop: true, overlapsFooter: false });

    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('#conteudo')).toBeFocused();
  }

  test('funciona na investigação, acima do menu fixo', async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('case-nav')).toBeVisible();
    await checkBackToTop(page);
  });

  test('funciona no histórico', async ({ page, request }) => {
    const player = await createPlayer(request);
    for (let attempt = 0; attempt < 3; attempt += 1) await finishInvestigation(request, player);
    await startInvestigation(request, player, 'missao-002');
    await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto('/historico');
    await expect(page.getByTestId('history-list')).toBeVisible();
    await checkBackToTop(page);
  });

  test('com redução de movimento, volta ao topo instantaneamente na investigação', async ({
    page,
    request,
  }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('case-nav')).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    await page.getByTestId('back-to-top').click();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe('Varredura responsiva com nome longo', () => {
  for (const width of ALL_WIDTHS) {
    test(`catálogo, investigação, histórico e relatório sem rolagem horizontal em ${width}px`, async ({
      page,
      request,
    }) => {
      const player = await createPlayer(request, LONG_NAME);
      const resultId = await finishInvestigation(request, player);
      const investigationId = await startInvestigation(request, player, 'missao-003');
      await restoreSession(page, player);
      await page.setViewportSize({ width, height: 844 });

      const pages = [
        { path: '/', ready: 'mission-list' },
        { path: `/investigacoes/${investigationId}`, ready: 'case-nav' },
        { path: '/historico', ready: 'history-list' },
        { path: `/investigacoes/${resultId}/resultado`, ready: 'result-page' },
      ];
      for (const target of pages) {
        await page.goto(target.path);
        await expect(page.getByTestId(target.ready)).toBeVisible();
        const report = await page.evaluate(() => {
          const logout = document.querySelector('[data-testid="logout-button"]')!;
          const brand = document
            .querySelector('[data-testid="brand-link"]')!
            .getBoundingClientRect();
          const box = logout.getBoundingClientRect();
          const topmost = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          );
          return {
            pageOverflow:
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
            logoutOnBrandRow: box.top < brand.bottom && brand.top < box.bottom,
            logoutClickable: !!topmost && logout.contains(topmost),
          };
        });
        expect(report, `${target.path} em ${width}px`).toEqual({
          pageOverflow: 0,
          logoutOnBrandRow: true,
          logoutClickable: true,
        });
      }
    });
  }
});
