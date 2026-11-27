import type { DetectiveClassification } from '../models/investigation.model';

/** Critérios de pontuação da RN05. */
export const SCORING_RULES = {
  correctSuspectPoints: 70,
  decisiveEvidenceBonus: 30,
  hintPenalty: 10,
  minimumScore: 0,
  maximumScore: 100,
} as const;

export interface ScoreInput {
  isCorrectSuspect: boolean;
  isDecisiveEvidence: boolean;
  hintsUsed: number;
}

export function calculateScore({
  isCorrectSuspect,
  isDecisiveEvidence,
  hintsUsed,
}: ScoreInput): number {
  let score = 0;
  if (isCorrectSuspect) {
    score += SCORING_RULES.correctSuspectPoints;
    if (isDecisiveEvidence) {
      score += SCORING_RULES.decisiveEvidenceBonus;
    }
  }
  score -= hintsUsed * SCORING_RULES.hintPenalty;
  return Math.min(SCORING_RULES.maximumScore, Math.max(SCORING_RULES.minimumScore, score));
}

/** Pontuação mínima para o relatório revelar o culpado, a evidência decisiva e a explicação. */
export const SOLUTION_REVEAL_MIN_SCORE = 50;

/**
 * A solução do caso só é revelada em tentativas encerradas por acusação (RN08) que
 * alcançaram pelo menos SOLUTION_REVEAL_MIN_SCORE pontos. Sem pontuação (em andamento ou
 * abandonada), nunca é revelada.
 */
export function canRevealSolution(score: number | null): boolean {
  return score !== null && score >= SOLUTION_REVEAL_MIN_SCORE;
}

export function classifyDetective(score: number): DetectiveClassification {
  if (score >= 90) return 'Detetive Mestre';
  if (score >= 70) return 'Investigador Experiente';
  if (score >= 40) return 'Detetive Aprendiz';
  return 'Investigação Inconclusiva';
}
