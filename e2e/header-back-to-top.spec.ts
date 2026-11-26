import { expect, test, type Page } from '@playwright/test';
import { createPlayer, restoreSession } from './support/api';

/**
 * Entrega 1 — responsividade do cabeçalho e botão "Voltar ao topo".
 * O botão "Sair" fica sempre na extremidade direita, na linha da marca,
 * sem quebrar sozinho nem sobrepor nome, logotipo ou links.
 */
const WIDTHS = [320, 375, 420, 463, 647, 768, 1280];

// Nome de 79 caracteres, no limite do aceito pela API (80).
const LONG_NAME = 'Maria Eduarda Albuquerque Montenegro Vasconcelos de Andrade Cavalcanti Ferreira';

interface HeaderMeasure {
  headerRight: number;
  logout: DOMRect;
  brand: DOMRect;
  overlaps: string[];
  pageOverflow: number;
  logoutLines: number;
}

async function measureHeader(page: Page): Promise<HeaderMeasure> {
  return page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const header = document.querySelector('.app-header')!;
    const style = getComputedStyle(header);
    const parts: Record<string, DOMRect> = {
      brand: rect('[data-testid="brand-link"]'),
      user: rect('.app-header__user'),
      nav: rect('.app-header__nav'),
      logout: rect('[data-testid="logout-button"]'),
    };
    const names = Object.keys(parts);
    const overlaps: string[] = [];
    for (let i = 0; i < names.length; i += 1) {
      for (let j = i + 1; j < names.length; j += 1) {
        const a = parts[names[i]];
        const b = parts[names[j]];
        const intersects =
          a.left < b.right - 0.5 &&
          b.left < a.right - 0.5 &&
          a.top < b.bottom - 0.5 &&
          b.top < a.bottom - 0.5;
        if (intersects) overlaps.push(`${names[i]}×${names[j]}`);
      }
    }
    const logoutEl = document.querySelector('[data-testid="logout-button"]')!;
    const lineHeight = parseFloat(getComputedStyle(logoutEl).lineHeight) || 16;
    const range = document.createRange();
    range.selectNodeContents(logoutEl);
    return {
      headerRight: header.getBoundingClientRect().right - parseFloat(style.paddingRight),
      logout: parts.logout.toJSON(),
      brand: parts.brand.toJSON(),
      overlaps,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      logoutLines: Math.round(range.getBoundingClientRect().height / lineHeight),
    };
  });
}

test.describe('Cabeçalho responsivo', () => {
  for (const [label, name] of [
    ['nome curto', 'Ana Lima'],
    ['nome longo (79 caracteres)', LONG_NAME],
  ] as const) {
    test(`"Sair" fica à direita, na linha da marca, sem sobreposição — ${label}`, async ({
      page,
      request,
    }) => {
      const player = await createPlayer(request, name);
      await restoreSession(page, player);

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/');
        await expect(page.getByTestId('current-user-name')).toBeVisible();

        const m = await measureHeader(page);
        const context = `largura ${width}px`;
        expect(m.overlaps, context).toEqual([]);
        expect(m.pageOverflow, context).toBeLessThanOrEqual(0);
        expect(Math.abs(m.headerRight - m.logout.right), context).toBeLessThanOrEqual(1);
        // Mesma linha da marca: os intervalos verticais se cruzam.
        expect(m.logout.top < m.brand.bottom && m.brand.top < m.logout.bottom, context).toBe(true);
        expect(m.logoutLines, context).toBe(1);
      }
    });
  }

  test('visitante anônimo vê Entrar e Cadastrar sem estouro horizontal em 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/login');
    await expect(page.getByTestId('nav-login')).toBeVisible();
    await expect(page.getByTestId('nav-register')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('Botão "Voltar ao topo"', () => {
  test.beforeEach(async ({ page, request }) => {
    const player = await createPlayer(request);
    await restoreSession(page, player);
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/');
    await expect(page.getByTestId('current-user-name')).toBeVisible();
  });

  const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

  test('aparece após rolar, tem nome acessível e volta ao topo com foco no conteúdo', async ({
    page,
  }) => {
    const button = page.getByRole('button', { name: 'Voltar ao topo' });
    await expect(button).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(button).toBeVisible();

    await button.click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page.locator('#conteudo')).toBeFocused();
    await expect(button).toHaveCount(0);
  });

  test('funciona pelo teclado (Enter)', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const button = page.getByTestId('back-to-top');
    await expect(button).toBeVisible();

    await button.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page.locator('#conteudo')).toBeFocused();
  });

  test('com redução de movimento, volta ao topo instantaneamente', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const button = page.getByTestId('back-to-top');
    await expect(button).toBeVisible();

    await button.click();
    // Sem animação: a posição já é 0 logo após o clique, sem esperar.
    expect(await scrollY(page)).toBe(0);
  });
});
