import type { Difficulty, Mission } from '../../models/mission.model';
import { MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION } from '../../services/evidence-rules';

/** Distribuição exigida do catálogo gratuito. */
export const CATALOG_DISTRIBUTION: Record<Difficulty, number> = {
  FACIL: 3,
  MEDIO: 3,
  DIFICIL: 4,
};

/**
 * Exigências estruturais por dificuldade. A dificuldade não é medida só pela quantidade de
 * evidências: conta também a profundidade da cadeia até a prova decisiva e o cruzamento de pistas.
 */
const DIFFICULTY_REQUIREMENTS: Record<
  Difficulty,
  {
    minSuspects: number;
    minHints: number;
    minEvidences: number;
    /** Níveis da cadeia de dependências até a prova decisiva (evidência inicial = 1). */
    minDecisiveDepth: number;
    /** Evidências que precisam ser analisadas, direta ou indiretamente, antes da prova decisiva. */
    minDecisiveAncestors: number;
    /** Pré-requisitos diretos da prova decisiva (cruzamento de linhas de investigação). */
    minDecisiveDirectRequirements: number;
    /** Evidências iniciais distintas das quais a prova decisiva depende (linhas independentes). */
    minDecisiveIndependentLines: number;
  }
> = {
  FACIL: {
    minSuspects: 3,
    minHints: 2,
    minEvidences: 5,
    minDecisiveDepth: 1,
    minDecisiveAncestors: 0,
    minDecisiveDirectRequirements: 0,
    minDecisiveIndependentLines: 0,
  },
  MEDIO: {
    minSuspects: 4,
    minHints: 2,
    minEvidences: 7,
    minDecisiveDepth: 3,
    minDecisiveAncestors: 2,
    minDecisiveDirectRequirements: 1,
    minDecisiveIndependentLines: 1,
  },
  DIFICIL: {
    minSuspects: 5,
    minHints: 3,
    minEvidences: 10,
    minDecisiveDepth: 3,
    minDecisiveAncestors: 3,
    minDecisiveDirectRequirements: 2,
    minDecisiveIndependentLines: 2,
  },
};

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

/** Profundidade de cada evidência na cadeia de dependências (sem pré-requisitos = 1). */
export function computeEvidenceDepths(mission: Mission): Map<string, number> {
  const byId = new Map(mission.evidences.map((evidence) => [evidence.evidenceId, evidence]));
  const depths = new Map<string, number>();
  const visit = (id: string, path: Set<string>): number => {
    const known = depths.get(id);
    if (known !== undefined) return known;
    if (path.has(id)) throw new Error(`Dependência circular em ${mission.missionId}: ${id}.`);
    const evidence = byId.get(id);
    if (!evidence) return 0;
    path.add(id);
    const depth =
      1 + Math.max(0, ...evidence.requires.map((requiredId) => visit(requiredId, path)));
    path.delete(id);
    depths.set(id, depth);
    return depth;
  };
  mission.evidences.forEach((evidence) => visit(evidence.evidenceId, new Set()));
  return depths;
}

/** Todas as evidências que precisam ser analisadas antes de `evidenceId`. */
export function collectAncestors(mission: Mission, evidenceId: string): Set<string> {
  const byId = new Map(mission.evidences.map((evidence) => [evidence.evidenceId, evidence]));
  const ancestors = new Set<string>();
  const pending = [...(byId.get(evidenceId)?.requires ?? [])];
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (ancestors.has(id)) continue;
    ancestors.add(id);
    pending.push(...(byId.get(id)?.requires ?? []));
  }
  return ancestors;
}

/**
 * Garante a consistência dos dados de uma missão antes de gravá-la:
 * identificadores únicos, referências válidas, ausência de dependências circulares,
 * solução alcançável e estrutura compatível com a dificuldade.
 */
export function assertMissionIntegrity(mission: Mission): void {
  const fail = (reason: string): never => {
    throw new Error(`Missão ${mission.missionId} inconsistente: ${reason}`);
  };

  for (const [kind, ids] of [
    ['suspeitos', mission.suspects.map((suspect) => suspect.suspectId)],
    ['evidências', mission.evidences.map((evidence) => evidence.evidenceId)],
    ['dicas', mission.hints.map((hint) => hint.hintId)],
  ] as const) {
    const duplicates = findDuplicates(ids);
    if (duplicates.length > 0) fail(`${kind} com id repetido: ${duplicates.join(', ')}.`);
  }

  const evidenceIds = new Set(mission.evidences.map((evidence) => evidence.evidenceId));
  const suspectIds = new Set(mission.suspects.map((suspect) => suspect.suspectId));

  for (const evidence of mission.evidences) {
    for (const requiredId of evidence.requires) {
      if (!evidenceIds.has(requiredId))
        fail(`${evidence.evidenceId} exige ${requiredId}, que não existe.`);
      if (requiredId === evidence.evidenceId) fail(`${evidence.evidenceId} exige a si mesma.`);
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
  const initialEvidences = mission.evidences.filter((evidence) => evidence.requires.length === 0);
  if (initialEvidences.length < MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION) {
    fail('a investigação precisa começar com evidências livres suficientes.');
  }

  // A explicação precisa nomear o culpado listado entre os suspeitos.
  const culprit = mission.suspects.find(
    (suspect) => suspect.suspectId === mission.solution.culpritSuspectId,
  )!;
  if (!mission.solution.explanation.includes(culprit.name)) {
    fail('a explicação da solução não menciona o culpado.');
  }

  const rules = DIFFICULTY_REQUIREMENTS[mission.difficulty];
  const decisive = mission.evidences.find(
    (evidence) => evidence.evidenceId === mission.solution.decisiveEvidenceId,
  )!;
  const decisiveDepth = computeEvidenceDepths(mission).get(decisive.evidenceId) ?? 0;
  const decisiveAncestors = collectAncestors(mission, decisive.evidenceId).size;

  if (mission.suspects.length < rules.minSuspects) fail('poucos suspeitos para a dificuldade.');
  if (mission.hints.length < rules.minHints) fail('poucas dicas para a dificuldade.');
  if (mission.evidences.length < rules.minEvidences) fail('poucas evidências para a dificuldade.');
  if (decisiveDepth < rules.minDecisiveDepth)
    fail('a prova decisiva está muito próxima do início da investigação.');
  if (decisiveAncestors < rules.minDecisiveAncestors)
    fail('a prova decisiva exige pouco cruzamento de evidências.');
  if (decisive.requires.length < rules.minDecisiveDirectRequirements)
    fail('a prova decisiva não cruza linhas de investigação diferentes.');
  const decisiveLines = [...collectAncestors(mission, decisive.evidenceId)].filter(
    (id) => mission.evidences.find((evidence) => evidence.evidenceId === id)?.requires.length === 0,
  ).length;
  if (decisiveLines < rules.minDecisiveIndependentLines)
    fail('a prova decisiva depende de uma única linha de investigação.');
}

/** Valida o catálogo completo: ids e ordens únicos e a distribuição por dificuldade. */
export function assertCatalogIntegrity(missions: readonly Mission[]): void {
  const fail = (reason: string): never => {
    throw new Error(`Catálogo inconsistente: ${reason}`);
  };
  const duplicatedIds = findDuplicates(missions.map((mission) => mission.missionId));
  if (duplicatedIds.length > 0) fail(`missões com id repetido: ${duplicatedIds.join(', ')}.`);
  const duplicatedOrders = findDuplicates(missions.map((mission) => String(mission.order)));
  if (duplicatedOrders.length > 0) fail(`ordens repetidas: ${duplicatedOrders.join(', ')}.`);

  const expectedTotal = Object.values(CATALOG_DISTRIBUTION).reduce((sum, count) => sum + count, 0);
  if (missions.length !== expectedTotal)
    fail(`esperadas ${expectedTotal} missões, encontradas ${missions.length}.`);
  for (const [difficulty, expected] of Object.entries(CATALOG_DISTRIBUTION)) {
    const found = missions.filter((mission) => mission.difficulty === difficulty).length;
    if (found !== expected)
      fail(`esperadas ${expected} missões ${difficulty}, encontradas ${found}.`);
  }
  missions.forEach(assertMissionIntegrity);
}
