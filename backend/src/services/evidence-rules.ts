import type { Evidence } from '../models/mission.model';

/** Quantidade mínima de evidências analisadas para permitir a acusação (RN04). */
export const MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION = 3;

/** Pré-requisitos de uma evidência que ainda não foram analisados (RN03). */
export function findMissingRequirements(
  evidence: Evidence,
  analyzedEvidenceIds: readonly string[],
): string[] {
  return evidence.requires.filter((requiredId) => !analyzedEvidenceIds.includes(requiredId));
}

export function isEvidenceUnlocked(
  evidence: Evidence,
  analyzedEvidenceIds: readonly string[],
): boolean {
  return findMissingRequirements(evidence, analyzedEvidenceIds).length === 0;
}

/** Ids de todas as evidências cujos pré-requisitos já foram cumpridos. */
export function computeUnlockedEvidenceIds(
  evidences: readonly Evidence[],
  analyzedEvidenceIds: readonly string[],
): string[] {
  return evidences
    .filter((evidence) => isEvidenceUnlocked(evidence, analyzedEvidenceIds))
    .map((evidence) => evidence.evidenceId);
}
