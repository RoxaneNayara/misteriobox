import { describe, expect, it } from 'vitest';
import {
  CATALOG_DISTRIBUTION,
  assertCatalogIntegrity,
  assertMissionIntegrity,
  collectAncestors,
  computeEvidenceDepths,
} from '../../src/database/seed/mission-integrity';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import type { Mission } from '../../src/models/mission.model';

const byId = (missionId: string) =>
  DEMO_MISSIONS.find((mission) => mission.missionId === missionId)!;
const clone = (mission: Mission): Mission => structuredClone(mission);

describe('Catálogo de missões — integridade', () => {
  it('tem exatamente 10 missões, na distribuição 3 fáceis / 3 médias / 4 difíceis', () => {
    expect(DEMO_MISSIONS).toHaveLength(10);
    expect(CATALOG_DISTRIBUTION).toEqual({ FACIL: 3, MEDIO: 3, DIFICIL: 4 });
    const count = (difficulty: Mission['difficulty']) =>
      DEMO_MISSIONS.filter((mission) => mission.difficulty === difficulty).length;
    expect([count('FACIL'), count('MEDIO'), count('DIFICIL')]).toEqual([3, 3, 4]);
    expect(() => assertCatalogIntegrity(DEMO_MISSIONS)).not.toThrow();
  });

  it('usa ids e ordens únicos, de missao-001 a missao-010', () => {
    expect(DEMO_MISSIONS.map((mission) => mission.missionId)).toEqual(
      Array.from({ length: 10 }, (_, index) => `missao-${String(index + 1).padStart(3, '0')}`),
    );
    expect(DEMO_MISSIONS.map((mission) => mission.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('preserva as três missões originais (ids, títulos e dificuldades)', () => {
    expect(
      ['missao-001', 'missao-002', 'missao-003'].map((id) => [byId(id).title, byId(id).difficulty]),
    ).toEqual([
      ['O Último Aplauso', 'FACIL'],
      ['O Quarto 307', 'MEDIO'],
      ['A Carta de Novembro', 'DIFICIL'],
    ]);
  });

  it('inclui as sete novas missões com a dificuldade definida', () => {
    expect(
      DEMO_MISSIONS.slice(3).map((mission) => [
        mission.missionId,
        mission.title,
        mission.difficulty,
      ]),
    ).toEqual([
      ['missao-004', 'A Assinatura Falsa', 'FACIL'],
      ['missao-005', 'O Troféu Trocado', 'FACIL'],
      ['missao-006', 'O Segredo da Galeria', 'MEDIO'],
      ['missao-007', 'O Voto Decisivo', 'MEDIO'],
      ['missao-008', 'Protocolo Zero', 'DIFICIL'],
      ['missao-009', 'O Testamento Impossível', 'DIFICIL'],
      ['missao-010', 'O Arquivo 17', 'DIFICIL'],
    ]);
  });

  it('dá a cada nova missão uma estrutura própria (evidências, suspeitos e dicas)', () => {
    expect(
      DEMO_MISSIONS.slice(3).map((mission) => [
        mission.missionId,
        mission.evidences.length,
        mission.suspects.length,
        mission.hints.length,
      ]),
    ).toEqual([
      ['missao-004', 5, 3, 2],
      ['missao-005', 6, 4, 2],
      ['missao-006', 8, 4, 3],
      ['missao-007', 9, 5, 2],
      ['missao-008', 13, 5, 3],
      ['missao-009', 12, 6, 4],
      ['missao-010', 15, 6, 3],
    ]);
  });

  it('tem temas variados (nenhum tema repetido)', () => {
    const themes = DEMO_MISSIONS.map((mission) => mission.theme);
    expect(new Set(themes).size).toBe(themes.length);
  });

  describe.each(DEMO_MISSIONS.map((mission) => [mission.missionId, mission] as const))(
    '%s',
    (_id, mission) => {
      it('tem culpado entre os suspeitos e evidência decisiva existente e alcançável', () => {
        expect(mission.suspects.map((suspect) => suspect.suspectId)).toContain(
          mission.solution.culpritSuspectId,
        );
        const depths = computeEvidenceDepths(mission);
        expect(depths.get(mission.solution.decisiveEvidenceId)).toBeGreaterThan(0);
        expect(() => assertMissionIntegrity(mission)).not.toThrow();
      });

      it('não tem ids repetidos nem referências quebradas', () => {
        const evidenceIds = mission.evidences.map((evidence) => evidence.evidenceId);
        expect(new Set(evidenceIds).size).toBe(evidenceIds.length);
        const suspectIds = mission.suspects.map((suspect) => suspect.suspectId);
        expect(new Set(suspectIds).size).toBe(suspectIds.length);
        for (const evidence of mission.evidences) {
          for (const requiredId of evidence.requires) expect(evidenceIds).toContain(requiredId);
        }
        for (const hint of mission.hints) expect(evidenceIds).toContain(hint.relatedEvidenceId);
      });

      it('explica a solução citando o culpado e a prova decisiva', () => {
        const culprit = mission.suspects.find(
          (suspect) => suspect.suspectId === mission.solution.culpritSuspectId,
        )!;
        expect(mission.solution.explanation).toContain(culprit.name);
        expect(mission.solution.explanation).toMatch(/prova decisiva/i);
      });
    },
  );

  it('missões difíceis exigem cadeias mais longas e cruzamento de evidências', () => {
    for (const mission of DEMO_MISSIONS.filter((m) => m.difficulty === 'DIFICIL')) {
      const decisive = mission.evidences.find(
        (evidence) => evidence.evidenceId === mission.solution.decisiveEvidenceId,
      )!;
      expect(mission.suspects.length).toBeGreaterThanOrEqual(5);
      expect(decisive.requires.length).toBeGreaterThanOrEqual(2);
      expect(collectAncestors(mission, decisive.evidenceId).size).toBeGreaterThanOrEqual(3);
      expect(computeEvidenceDepths(mission).get(decisive.evidenceId)).toBeGreaterThanOrEqual(3);
      // A prova decisiva depende de pelo menos duas linhas independentes (evidências iniciais distintas).
      const initialAncestors = [...collectAncestors(mission, decisive.evidenceId)].filter(
        (id) =>
          mission.evidences.find((evidence) => evidence.evidenceId === id)!.requires.length === 0,
      );
      expect(initialAncestors.length, mission.missionId).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Validação de integridade — casos inválidos', () => {
  const base = () => clone(byId('missao-004'));

  it('recusa culpado fora da lista de suspeitos', () => {
    const mission = base();
    mission.solution.culpritSuspectId = 'ninguem';
    expect(() => assertMissionIntegrity(mission)).toThrow(/culpado inexistente/);
  });

  it('recusa evidência decisiva inexistente', () => {
    const mission = base();
    mission.solution.decisiveEvidenceId = 'ev-99';
    expect(() => assertMissionIntegrity(mission)).toThrow(/evidência decisiva inexistente/);
  });

  it('recusa dependência circular', () => {
    const mission = base();
    mission.evidences[0].requires = ['ev-05'];
    expect(() => assertMissionIntegrity(mission)).toThrow(/circular|inalcançáveis/);
  });

  it('recusa pré-requisito inexistente', () => {
    const mission = base();
    mission.evidences[1].requires = ['ev-42'];
    expect(() => assertMissionIntegrity(mission)).toThrow(/não existe/);
  });

  it('recusa ids de evidência repetidos', () => {
    const mission = base();
    mission.evidences[1].evidenceId = 'ev-01';
    expect(() => assertMissionIntegrity(mission)).toThrow(/id repetido/);
  });

  it('recusa dica ligada a evidência inexistente', () => {
    const mission = base();
    mission.hints[0].relatedEvidenceId = 'ev-77';
    expect(() => assertMissionIntegrity(mission)).toThrow(/dica/);
  });

  it('recusa missão difícil cuja prova decisiva não exige cruzamento de evidências', () => {
    const mission = clone(byId('missao-010'));
    mission.evidences.find((evidence) => evidence.evidenceId === 'ev-07')!.requires = ['ev-04'];
    expect(() => assertMissionIntegrity(mission)).toThrow(/cruza|cruzamento/);
  });

  it('recusa missão que começa com menos de três evidências livres', () => {
    const mission = base();
    mission.evidences[2].requires = ['ev-01'];
    expect(() => assertMissionIntegrity(mission)).toThrow(/evidências livres/);
  });

  it('recusa missão difícil cuja prova decisiva depende de uma única linha de investigação', () => {
    const mission = clone(byId('missao-010'));
    mission.evidences.find((evidence) => evidence.evidenceId === 'ev-04')!.requires = ['ev-01'];
    expect(() => assertMissionIntegrity(mission)).toThrow(/única linha/);
  });

  it('recusa catálogo com distribuição diferente de 3/3/4', () => {
    const missions = DEMO_MISSIONS.map(clone);
    missions[3].difficulty = 'MEDIO';
    expect(() => assertCatalogIntegrity(missions)).toThrow(/Catálogo inconsistente/);
  });

  it('recusa catálogo com ids repetidos', () => {
    const missions = DEMO_MISSIONS.map(clone);
    missions[9].missionId = 'missao-001';
    expect(() => assertCatalogIntegrity(missions)).toThrow(/id repetido/);
  });
});
