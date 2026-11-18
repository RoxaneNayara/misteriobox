import type {
  InvestigationHistoryItem,
  InvestigationProgress,
  InvestigationResult,
} from '../types/api';
import { apiRequest } from './client';

const basePath = (investigationId: string) =>
  `/investigations/${encodeURIComponent(investigationId)}`;

export const investigationsApi = {
  /** Histórico do jogador autenticado, da tentativa mais recente para a mais antiga. */
  listHistory(): Promise<InvestigationHistoryItem[]> {
    return apiRequest('/investigations');
  },

  start(missionId: string): Promise<InvestigationProgress> {
    return apiRequest('/investigations', { method: 'POST', body: { missionId } });
  },

  getProgress(investigationId: string): Promise<InvestigationProgress> {
    return apiRequest(basePath(investigationId));
  },

  analyzeEvidence(investigationId: string, evidenceId: string): Promise<InvestigationProgress> {
    return apiRequest(
      `${basePath(investigationId)}/evidences/${encodeURIComponent(evidenceId)}/analysis`,
      { method: 'POST' },
    );
  },

  useHint(investigationId: string): Promise<InvestigationProgress> {
    return apiRequest(`${basePath(investigationId)}/hints`, { method: 'POST' });
  },

  abandon(investigationId: string): Promise<InvestigationProgress> {
    return apiRequest(`${basePath(investigationId)}/abandon`, { method: 'POST' });
  },

  accuse(
    investigationId: string,
    suspectId: string,
    evidenceId: string,
  ): Promise<InvestigationResult> {
    return apiRequest(`${basePath(investigationId)}/accusation`, {
      method: 'POST',
      body: { suspectId, evidenceId },
    });
  },

  getResult(investigationId: string): Promise<InvestigationResult> {
    return apiRequest(`${basePath(investigationId)}/result`);
  },
};
