import type { Mission } from '../../models/mission.model';
import { MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION } from '../../services/evidence-rules';

/**
 * Garante a consistência dos dados de uma missão antes de gravá-la:
 * referências válidas, ausência de dependências circulares e solução alcançável.
 */
export function assertMissionIntegrity(mission: Mission): void {
  const fail = (reason: string): never => {
    throw new Error(`Missão ${mission.missionId} inconsistente: ${reason}`);
  };
  const evidenceIds = new Set(mission.evidences.map((evidence) => evidence.evidenceId));
  const suspectIds = new Set(mission.suspects.map((suspect) => suspect.suspectId));

  for (const evidence of mission.evidences) {
    for (const requiredId of evidence.requires) {
      if (!evidenceIds.has(requiredId))
        fail(`${evidence.evidenceId} exige ${requiredId}, que não existe.`);
    }
  }
  for (const hint of mission.hints) {
    if (!evidenceIds.has(hint.relatedEvidenceId)) fail(`dica ${hint.hintId} sem evidência válida.`);
  }
  if (!suspectIds.has(mission.solution.culpritSuspectId)) fail('culpado inexistente.');
  if (!evidenceIds.has(mission.solution.decisiveEvidenceId))
    fail('evidência decisiva inexistente.');

  // Simula o desbloqueio progressivo: toda evidência deve ser alcançável (sem ciclos).
  const reachable = new Set<string>();
  let unlockedSomething = true;
  while (unlockedSomething) {
    unlockedSomething = false;
    for (const evidence of mission.evidences) {
      if (
        !reachable.has(evidence.evidenceId) &&
        evidence.requires.every((id) => reachable.has(id))
      ) {
        reachable.add(evidence.evidenceId);
        unlockedSomething = true;
      }
    }
  }
  if (reachable.size !== mission.evidences.length) {
    fail('existem evidências inalcançáveis ou dependências circulares.');
  }
  if (mission.evidences.length < MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION) {
    fail('evidências insuficientes para permitir a acusação.');
  }
}
