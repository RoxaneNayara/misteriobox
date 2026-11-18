import { LightbulbIcon } from '../../components/Icons';
import type { InvestigationProgress } from '../../types/api';

interface HintPanelProps {
  hints: InvestigationProgress['hints'];
  disabled: boolean;
  onRequestHint: () => void;
}

/** Notas do informante: dicas reveladas e opção de pedir a próxima. */
export function HintPanel({ hints, disabled, onRequestHint }: HintPanelProps) {
  return (
    <div className="hint-panel" data-testid="hint-panel">
      <div className="hint-panel__header">
        <span className="hint-panel__slots" aria-hidden="true">
          {Array.from({ length: hints.total }, (_, slot) => (
            <span
              key={slot}
              className={`hint-panel__slot ${slot < hints.used.length ? 'is-used' : ''}`}
            >
              <LightbulbIcon />
            </span>
          ))}
        </span>
        <p className="hint-panel__summary" data-testid="hint-counter">
          Dicas usadas: {hints.used.length} de {hints.total}. Cada dica desconta 10 pontos da
          pontuação final.
        </p>
      </div>
      {hints.used.length > 0 && (
        <ol className="hint-list" data-testid="hint-list">
          {hints.used.map((hint, index) => (
            <li key={hint.id} className="hint-note" data-testid={`hint-${hint.id}`}>
              <span className="hint-note__label">Nota {index + 1}</span>
              <p>{hint.text}</p>
              <p className="hint-note__related">Relacionada a: {hint.relatedEvidence.title}</p>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        className="button button--secondary"
        onClick={onRequestHint}
        disabled={disabled || hints.remaining === 0}
        data-testid="hint-request"
      >
        <LightbulbIcon />
        {hints.remaining === 0 ? 'Sem dicas restantes' : 'Consultar dica (-10 pontos)'}
      </button>
    </div>
  );
}
