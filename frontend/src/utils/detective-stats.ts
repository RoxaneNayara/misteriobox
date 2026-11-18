import type { InvestigationHistoryItem, MissionCatalogItem } from '../types/api';

export interface DetectiveStats {
  availableCases: number;
  casesInProgress: number;
  solvedCases: number;
}

/** Quantidade de missões distintas que possuem ao menos uma tentativa no status informado. */
function countDistinctMissions(
  history: InvestigationHistoryItem[],
  status: InvestigationHistoryItem['status'],
): number {
  return new Set(
    history.filter((attempt) => attempt.status === status).map((attempt) => attempt.mission.id),
  ).size;
}

/**
 * Indicadores do painel do detetive, derivados dos dados reais da API.
 * "Solucionados" conta missões distintas: resolver o mesmo caso duas vezes vale 1.
 */
export function computeDetectiveStats(
  missions: MissionCatalogItem[],
  history: InvestigationHistoryItem[],
): DetectiveStats {
  return {
    availableCases: missions.length,
    casesInProgress: countDistinctMissions(history, 'EM_ANDAMENTO'),
    solvedCases: countDistinctMissions(history, 'SOLUCIONADO'),
  };
}
