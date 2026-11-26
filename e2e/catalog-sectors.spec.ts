import { expect, test } from '@playwright/test';
import { createPlayer, restoreSession } from './support/api';

/**
 * Entrega 2 — catálogo com 10 dossiês organizados em três setores
 * e a seção "Divisões especializadas — Em breve".
 */
const SECTORS = [
  {
    difficulty: 'FACIL',
    title: 'Investigações iniciais',
    missions: ['missao-001', 'missao-004', 'missao-005'],
  },
  {
    difficulty: 'MEDIO',
    title: 'Investigações especiais',
    missions: ['missao-002', 'missao-006', 'missao-007'],
  },
  {
    difficulty: 'DIFICIL',
    title: 'Investigações de alta complexidade',
    missions: ['missao-003', 'missao-008', 'missao-009', 'missao-010'],
  },
] as const;

test.describe('Catálogo por setores', () => {
  test.beforeEach(async ({ page, request }) => {
    const player = await createPlayer(request);
    await restoreSession(page, player);
  });

  test('organiza os 10 dossiês em três setores, na distribuição 3/3/4', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stat-available')).toHaveText('10');

    for (const sector of SECTORS) {
      const section = page.getByTestId(`case-sector-${sector.difficulty}`);
      await expect(section.getByRole('heading', { level: 3, name: sector.title })).toBeVisible();
      await expect(section.locator('[data-testid^="mission-card-"]')).toHaveCount(
        sector.missions.length,
      );
      for (const missionId of sector.missions) {
        await expect(section.getByTestId(`mission-card-${missionId}`)).toBeVisible();
      }
    }
    await expect(page.locator('[data-testid^="mission-card-"]')).toHaveCount(10);
  });

  test('apresenta as divisões especializadas apenas como "Em breve", sem links nem ações', async ({
    page,
  }) => {
    await page.goto('/');
    const divisions = page.getByTestId('upcoming-divisions');
    await expect(divisions.getByRole('heading', { name: 'Divisões especializadas' })).toBeVisible();
    await expect(divisions).toContainText('Em breve');
    for (const name of ['Arquivo Morto', 'Crimes Cibernéticos', 'Homicídios']) {
      await expect(divisions.getByRole('heading', { name })).toBeVisible();
    }
    await expect(divisions.locator('a, button')).toHaveCount(0);
  });

  for (const width of [320, 375, 768, 1280]) {
    test(`não estoura a largura da tela com dez dossiês em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('[data-testid^="mission-card-"]')).toHaveCount(10);
      const issues = await page.evaluate(() => {
        const overflow =
          document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const clipped = [
          ...document.querySelectorAll(
            '.mission-card__stats, .case-sector__header, .upcoming-division',
          ),
        ].filter((element) => element.scrollWidth > element.clientWidth + 1).length;
        return { overflow, clipped };
      });
      expect(issues).toEqual({ overflow: 0, clipped: 0 });
    });
  }

  test('inicia uma missão nova pelo catálogo e mostra o progresso individual', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mission-action-missao-008').click();
    await expect(page.getByTestId('investigation-title')).toHaveText('Protocolo Zero');
    await expect(page.getByTestId('investigation-progress')).toContainText('0 de 11');

    await page.goto('/');
    await expect(page.getByTestId('mission-status-missao-008')).toContainText('Em andamento');
    await expect(page.getByTestId('mission-action-missao-008')).toHaveText(
      'Continuar investigação',
    );
    await expect(page.getByTestId('stat-in-progress')).toHaveText('1');
  });
});
