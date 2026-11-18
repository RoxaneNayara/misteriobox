import { DocumentIcon, EnvelopeIcon, LockIcon } from '../../components/Icons';
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

const STATE_ICONS: Record<Evidence['state'], typeof DocumentIcon> = {
  ANALISADA: DocumentIcon,
  DISPONIVEL: EnvelopeIcon,
  BLOQUEADA: LockIcon,
};

/** Quadro de evidências: documentos analisados, envelopes lacrados e arquivos bloqueados. */
export function EvidenceBoard({
  evidences,
  disabled,
  analyzingEvidenceId,
  onAnalyze,
}: EvidenceBoardProps) {
  return (
    <ul className="evidence-board" data-testid="evidence-list">
      {evidences.map((evidence, index) => {
        const StateIcon = STATE_ICONS[evidence.state];
        const tilt = ((index * 7) % 5) - 2;
        return (
          <li key={evidence.id} style={{ ['--tilt' as string]: `${tilt * 0.4}deg` }}>
            <article
              className={`evidence-card evidence-card--${evidence.state.toLowerCase()}`}
              data-testid={`evidence-card-${evidence.id}`}
              data-state={evidence.state}
              aria-labelledby={`evidence-title-${evidence.id}`}
            >
              <span className="evidence-card__pin" aria-hidden="true" />
              <header className="evidence-card__header">
                <span className="evidence-card__number">
                  <StateIcon /> Evidência {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`badge badge--evidence-${evidence.state.toLowerCase()}`}
                  data-testid={`evidence-state-${evidence.id}`}
                >
                  {STATE_LABELS[evidence.state]}
                </span>
              </header>
              <h3 id={`evidence-title-${evidence.id}`} className="evidence-card__title">
                {evidence.title}
              </h3>

              {evidence.state === 'ANALISADA' && (
                <p
                  className="evidence-card__content"
                  data-testid={`evidence-content-${evidence.id}`}
                >
                  {evidence.content}
                </p>
              )}

              {evidence.state === 'DISPONIVEL' && (
                <>
                  <p className="evidence-card__sealed">Envelope lacrado, pronto para exame.</p>
                  <button
                    type="button"
                    className="button button--primary button--small"
                    onClick={() => onAnalyze(evidence)}
                    disabled={disabled}
                    data-testid={`evidence-analyze-${evidence.id}`}
                  >
                    {analyzingEvidenceId === evidence.id ? 'Analisando...' : 'Analisar evidência'}
                  </button>
                </>
              )}

              {evidence.state === 'BLOQUEADA' && (
                <>
                  <span className="evidence-card__tape" aria-hidden="true">
                    Confidencial
                  </span>
                  <p
                    className="evidence-card__locked"
                    data-testid={`evidence-requirements-${evidence.id}`}
                  >
                    Conteúdo confidencial. Para desbloquear, analise:{' '}
                    {evidence.missingRequirements
                      .map((requirement) => requirement.title)
                      .join(', ')}
                    .
                  </p>
                </>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
