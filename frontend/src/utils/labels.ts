import type { InvestigationStatus } from '../types/api';

export const STATUS_LABELS: Record<InvestigationStatus, string> = {
  EM_ANDAMENTO: 'Em andamento',
  SOLUCIONADO: 'Solucionado',
  NAO_SOLUCIONADO: 'Não solucionado',
  ABANDONADO: 'Abandonado',
};

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatCaseNumber(missionId: string): string {
  const digits = missionId.replace(/\D/g, '');
  return `Caso nº ${digits || missionId}`;
}
