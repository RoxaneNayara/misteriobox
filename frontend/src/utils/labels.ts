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

/** Inicial do nome por ponto de código (não corta letras fora do plano básico). */
export function initialOf(name: string): string {
  return (Array.from(name.trim())[0] ?? '').toLocaleUpperCase('pt-BR');
}
