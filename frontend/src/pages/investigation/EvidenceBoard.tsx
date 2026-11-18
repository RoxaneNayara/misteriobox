import type { Evidence } from '../../types/api';

interface EvidenceBoardProps {
  evidences: Evidence[];
  disabled: boolean;
  analyzingEvidenceId: string | null;
  onAnalyze: (evidence: Evidence) => void;
}

const STATE_LABELS: Record<Evidence['state'], string> = {
  ANALISADA: 'Analisada',
  DISPONIVEL: 'Disponível',
  BLOQUEADA: 'Bloqueada',
};

export function EvidenceBoard({
  evidences,
  disabled,
  analyzingEvidenceId,
  onAnalyze,
}: EvidenceBoardProps) {
  return (
    <ul className="evidence-grid" data-testid="evidence-list">
      {evidences.map((evidence, index) => (
        <li key={evidence.id}>
          <article
            className={`evidence-card evidence-card--${evidence.state.toLowerCase()}`}
            data-testid={`evidence-card-${evidence.id}`}
            data-state={evidence.state}
          >
            <header className="evidence-card__header">
              <span className="evidence-card__number">Evidência {index + 1}</span>
              <span
                className={`badge badge--evidence-${evidence.state.toLowerCase()}`}
                data-testid={`evidence-state-${evidence.id}`}
              >
                {evidence.state === 'BLOQUEADA' && <span aria-hidden="true">🔒 </span>}
                {STATE_LABELS[evidence.state]}
              </span>
            </header>
            <h3 className="evidence-card__title">{evidence.title}</h3>

            {evidence.state === 'ANALISADA' && (
              <p className="evidence-card__content" data-testid={`evidence-content-${evidence.id}`}>
                {evidence.content}
              </p>
            )}

            {evidence.state === 'DISPONIVEL' && (
              <button
                type="button"
                className="button button--primary button--small"
                onClick={() => onAnalyze(evidence)}
                disabled={disabled}
                data-testid={`evidence-analyze-${evidence.id}`}
              >
                {analyzingEvidenceId === evidence.id ? 'Analisando...' : 'Analisar evidência'}
              </button>
            )}

            {evidence.state === 'BLOQUEADA' && (
              <p
                className="evidence-card__locked"
                data-testid={`evidence-requirements-${evidence.id}`}
              >
                Conteúdo confidencial. Para desbloquear, analise:{' '}
                {evidence.missingRequirements.map((requirement) => requirement.title).join(', ')}.
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
