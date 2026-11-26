import { expect, test, type Page } from '@playwright/test';
import { createPlayer, restoreSession, startInvestigation } from './support/api';

/**
 * B05 — Menu secundário da investigação (ISO 25010: usabilidade/portabilidade).
 * Larguras dos relatos (420–463 e 647–681 px, altura 818) e referências.
 */
const WIDTHS = [320, 420, 441, 463, 647, 664, 681, 768, 1280];
const SECTIONS = [
  'secao-caso',
  'secao-suspeitos',
  'secao-evidencias',
  'secao-dicas',
  'secao-acusacao',
];

async function layoutReport(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector('[data-testid="case-nav"]') as HTMLElement;
    const header = document.querySelector('.app-header') as HTMLElement;
    const navBox = nav.getBoundingClientRect();
    const headerBox = header.getBoundingClientRect();
    const headerIsSticky = getComputedStyle(header).position === 'sticky';
    const list = nav.querySelector('ul') as HTMLElement;
    const listBox = list.getBoundingClientRect();
    // Em telas estreitas o menu rola na horizontal: avalia as opções que estão à vista na faixa.
    const links = [...nav.querySelectorAll('a')]
      .map((link) => ({ link, box: link.getBoundingClientRect() }))
      .filter(({ box }) => box.left >= listBox.left - 1 && box.right <= listBox.right + 1)
      .map(({ link, box }) => {
        const topmost = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return {
          label: link.textContent,
          insideViewport: box.left >= 0 && box.right <= window.innerWidth,
          clickable: topmost === link || link.contains(topmost),
        };
      });
    return {
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      navOverflow: nav.scrollWidth - nav.clientWidth,
      navBelowHeader: headerIsSticky ? navBox.top >= headerBox.bottom - 1 : navBox.top >= -1,
      links,
    };
  });
}

/** Espera a rolagem (inclusive a suave) parar: duas leituras iguais com 200 ms de intervalo. */
async function waitForScrollToSettle(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            new Promise<boolean>((resolve) => {
              const start = window.scrollY;
              setTimeout(() => resolve(Math.abs(window.scrollY - start) < 1), 200);
            }),
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
}

function headingVisibleBelowNav(page: Page, sectionId: string): Promise<boolean> {
  return page.evaluate((id) => {
    const heading = document.getElementById(id)!.querySelector('h2')!.getBoundingClientRect();
    const nav = document.querySelector('[data-testid="case-nav"]')!.getBoundingClientRect();
    return heading.top >= nav.bottom - 1 && heading.bottom <= window.innerHeight;
  }, sectionId);
}

function activeLinkFullyVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const list = document.querySelector('[data-testid="case-nav"] ul')!.getBoundingClientRect();
    const active = document
      .querySelector('[data-testid="case-nav"] a[aria-current="location"]')
      ?.getBoundingClientRect();
    if (!active) return false;
    return (
      active.left >= list.left - 1 &&
      active.right <= list.right + 1 &&
      active.left >= 0 &&
      active.right <= window.innerWidth
    );
  });
}

for (const width of WIDTHS) {
  test(`B05 — menu da investigação acessível em ${width}x818`, async ({ page, request }) => {
    const player = await createPlayer(request);
    const investigationId = await startInvestigation(request, player, 'missao-003');
    await restoreSession(page, player);
    await page.setViewportSize({ width, height: 818 });
    await page.goto(`/investigacoes/${investigationId}`);
    await expect(page.getByTestId('case-nav')).toBeVisible();

    // Com a página rolada até o meio, o menu fica fixo e inteiramente utilizável.
    await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'instant' }));
    await waitForScrollToSettle(page);
    const report = await layoutReport(page);
    expect(report.pageOverflow, 'rolagem horizontal da página').toBeLessThanOrEqual(0);
    expect(report.navOverflow, 'opções cortadas no menu').toBeLessThanOrEqual(0);
    expect(report.navBelowHeader, 'menu encoberto pelo cabeçalho').toBe(true);
    expect(report.links.length, 'opções visíveis na faixa do menu').toBeGreaterThan(0);
    for (const link of report.links) {
      expect(link.insideViewport, `${link.label} fora da tela`).toBe(true);
      expect(link.clickable, `${link.label} encoberto`).toBe(true);
    }

    // Cada opção leva à seção, destaca a opção ativa e não esconde o título.
    for (const sectionId of SECTIONS) {
      const link = page.getByTestId(`case-nav-${sectionId}`);
      await link.click();
      await expect(link).toHaveAttribute('aria-current', 'location');
      // A opção ativa permanece inteira à vista na faixa do menu e dentro da tela.
      await expect.poll(() => activeLinkFullyVisible(page)).toBe(true);
      await expect
        .poll(() => headingVisibleBelowNav(page, sectionId), { message: `título de ${sectionId}` })
        .toBe(true);
      await waitForScrollToSettle(page);
      expect(await headingVisibleBelowNav(page, sectionId), `título de ${sectionId}`).toBe(true);
    }

    // Dois cliques rápidos: a última escolha prevalece.
    await page.getByTestId('case-nav-secao-suspeitos').click();
    await page.getByTestId('case-nav-secao-acusacao').click();
    await expect.poll(() => headingVisibleBelowNav(page, 'secao-acusacao')).toBe(true);
    await waitForScrollToSettle(page);
    await expect(page.getByTestId('case-nav-secao-acusacao')).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(await headingVisibleBelowNav(page, 'secao-acusacao')).toBe(true);
  });
}
