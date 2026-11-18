import type { Difficulty, InvestigationStatus } from '../types/api';
import { STATUS_LABELS } from '../utils/labels';

const DIFFICULTY_LEVEL: Record<Difficulty, number> = { FACIL: 1, MEDIO: 2, DIFICIL: 3 };

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  label: string;
  testId?: string;
}

/** Selo de dificuldade com indicador visual de 1 a 3 níveis. */
export function DifficultyBadge({ difficulty, label, testId }: DifficultyBadgeProps) {
  const level = DIFFICULTY_LEVEL[difficulty];
  return (
    <span className={`badge badge--difficulty-${difficulty.toLowerCase()}`} data-testid={testId}>
      <span className="badge__pips" aria-hidden="true">
        {[1, 2, 3].map((pip) => (
          <span key={pip} className={`badge__pip ${pip <= level ? 'badge__pip--on' : ''}`} />
        ))}
      </span>
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
    <span className={`badge badge--status badge--status-${modifier}`} data-testid={testId}>
      <span className="badge__dot" aria-hidden="true" />
      {status ? STATUS_LABELS[status] : 'Não iniciada'}
    </span>
  );
}
