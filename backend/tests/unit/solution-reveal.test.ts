import { describe, expect, it } from 'vitest';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import {
  calculateScore,
  canRevealSolution,
  SOLUTION_REVEAL_MIN_SCORE,
} from '../../src/services/scoring.service';

/** Todas as pontuações que o sistema consegue produzir, considerando as dicas de cada missão. */
function reachableScores(): Set<number> {
  const scores = new Set<number>();
  const maxHints = Math.max(...DEMO_MISSIONS.map((mission) => mission.hints.length));
  for (let hintsUsed = 0; hintsUsed <= maxHints; hintsUsed += 1) {
    for (const isCorrectSuspect of [true, false]) {
      for (const isDecisiveEvidence of [true, false]) {
        scores.add(calculateScore({ isCorrectSuspect, isDecisiveEvidence, hintsUsed }));
      }
    }
  }
  return scores;
}

describe('Regra de revelação da solução (50 pontos)', () => {
  it('usa 50 pontos como limite', () => {
    expect(SOLUTION_REVEAL_MIN_SCORE).toBe(50);
  });

  it.each([
    [0, false],
    [49, false],
    [50, true],
    [100, true],
  ])('pontuação %i → revela: %s', (score, expected) => {
    expect(canRevealSolution(score)).toBe(expected);
  });

  it('nunca revela sem pontuação (em andamento ou abandonada)', () => {
    expect(canRevealSolution(null)).toBe(false);
  });

  it('pontuações alcançáveis: 49 não existe; 40 é o maior valor abaixo do limite e 50 é alcançável', () => {
    const scores = [...reachableScores()].sort((a, b) => a - b);
    expect(scores).toEqual([0, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(scores).not.toContain(49);
    expect(Math.max(...scores.filter((score) => !canRevealSolution(score)))).toBe(40);
    expect(Math.min(...scores.filter((score) => canRevealSolution(score)))).toBe(50);
  });
});
