import type { Difficulty, InvestigationStatus } from '../types/api';
import { STATUS_LABELS } from '../utils/labels';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  label: string;
  testId?: string;
}

export function DifficultyBadge({ difficulty, label, testId }: DifficultyBadgeProps) {
  return (
    <span className={`badge badge--difficulty-${difficulty.toLowerCase()}`} data-testid={testId}>
      Dificuldade: {label}
    </span>
  );
}

interface StatusBadgeProps {
  status: InvestigationStatus | null;
  testId?: string;
}

export function StatusBadge({ status, testId }: StatusBadgeProps) {
  const modifier = status ? status.toLowerCase().replace('_', '-') : 'nova';
  return (
    <span className={`badge badge--status-${modifier}`} data-testid={testId}>
      {status ? STATUS_LABELS[status] : 'Não iniciada'}
    </span>
  );
}
