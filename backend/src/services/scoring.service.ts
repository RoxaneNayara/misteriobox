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

export function classifyDetective(score: number): DetectiveClassification {
  if (score >= 90) return 'Detetive Mestre';
  if (score >= 70) return 'Investigador Experiente';
  if (score >= 40) return 'Detetive Aprendiz';
  return 'Investigação Inconclusiva';
}
