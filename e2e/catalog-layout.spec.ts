import { expect, test, type Page } from '@playwright/test';
import { createPlayer, restoreSession } from './support/api';

/**
 * Alinhamento do topo do catálogo:
 * - credencial de detetive: os três cards (Casos disponíveis, Em andamento, Solucionados) têm a
 *   mesma altura e os números na mesma linha, mesmo quando só alguns rótulos quebram em duas linhas;
 * - "Arquivo central de casos": texto explicativo abaixo do título, alinhado à esquerda com ele e
 *   ocupando a largura do cabeçalho (sem limite em `ch` que o quebre em linhas curtas no desktop).
 */
async function openCatalog(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('stat-available')).toHaveText(/\d+/);
}

async function statBoxes(page: Page) {
  return page.locator('.detective-panel__stats > div').evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      const number = card.querySelector('dd')!.getBoundingClientRect();
      return { top: box.top, height: box.height, left: box.left, numberTop: number.top };
    }),
  );
}

test.describe('Catálogo — alinhamento da credencial e do arquivo central', () => {
  test.beforeEach(async ({ page, request }) => {
    await restoreSession(page, await createPlayer(request));
  });

  for (const width of [1280, 1024, 768]) {
    test(`cards da credencial com mesma estrutura e números alinhados (${width} px)`, async ({
      page,
    }) => {
      await openCatalog(page, width);
      const cards = await statBoxes(page);
      expect(cards).toHaveLength(3);
      for (const card of cards.slice(1)) {
        expect(Math.abs(card.top - cards[0].top)).toBeLessThan(1);
        expect(Math.abs(card.height - cards[0].height)).toBeLessThan(1);
        expect(Math.abs(card.numberTop - cards[0].numberTop)).toBeLessThan(1);
      }
    });
  }

  test('em telas estreitas os cards ficam empilhados, com o mesmo tamanho (390 px)', async ({
    page,
  }) => {
    await openCatalog(page, 390);
    const cards = await statBoxes(page);
    for (const card of cards.slice(1)) {
      expect(Math.abs(card.left - cards[0].left)).toBeLessThan(1);
      expect(Math.abs(card.height - cards[0].height)).toBeLessThan(1);
    }
    expect(cards[1].top).toBeGreaterThan(cards[0].top);
    expect(cards[2].top).toBeGreaterThan(cards[1].top);
  });

  for (const width of [1920, 1440, 1280, 1024, 768, 390, 320]) {
    test(`texto do arquivo central abaixo do título (${width} px)`, async ({ page }) => {
      await openCatalog(page, width);
      const title = (await page.locator('#archive-title').boundingBox())!;
      const lead = (await page.locator('.case-archive__lead').boundingBox())!;
      expect(lead.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
      expect(Math.abs(lead.x - title.x)).toBeLessThan(1);
    });
  }

  for (const width of [1920, 1440, 1280, 1024, 768, 390, 320]) {
    test(`texto do arquivo central usa a largura do cabeçalho, sem estouro (${width} px)`, async ({
      page,
    }) => {
      await openCatalog(page, width);
      const { header, lead, overflow } = await page.evaluate(() => ({
        header: document.querySelector('.case-archive__header')!.getBoundingClientRect().width,
        lead: document.querySelector('.case-archive__lead')!.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }));
      expect(Math.abs(lead - header)).toBeLessThan(1);
      expect(overflow).toBe(false);
    });
  }
});
