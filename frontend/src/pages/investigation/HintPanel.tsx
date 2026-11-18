import type { InvestigationProgress } from '../../types/api';

interface HintPanelProps {
  hints: InvestigationProgress['hints'];
  disabled: boolean;
  onRequestHint: () => void;
}

export function HintPanel({ hints, disabled, onRequestHint }: HintPanelProps) {
  return (
    <div className="hint-panel" data-testid="hint-panel">
      <p className="hint-panel__summary" data-testid="hint-counter">
        Dicas usadas: {hints.used.length} de {hints.total}. Cada dica desconta 10 pontos da
        pontuação final.
      </p>
      {hints.used.length > 0 && (
        <ol className="hint-list" data-testid="hint-list">
          {hints.used.map((hint) => (
            <li key={hint.id} className="hint-list__item" data-testid={`hint-${hint.id}`}>
              <p>{hint.text}</p>
              <p className="hint-list__related">Relacionada a: {hint.relatedEvidence.title}</p>
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
        {hints.remaining === 0 ? 'Sem dicas restantes' : 'Consultar dica (-10 pontos)'}
      </button>
    </div>
  );
}
