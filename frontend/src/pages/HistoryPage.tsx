import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import { MagnifierIcon } from '../components/Icons';
import type { InvestigationHistoryItem } from '../types/api';
import { formatDateTime } from '../utils/labels';

/** `null` significa ausência de pontuação; 0 é uma pontuação válida. */
function formatScore(attempt: InvestigationHistoryItem): string {
  if (attempt.score !== null) return `${attempt.score} pontos`;
  return attempt.status === 'EM_ANDAMENTO' ? 'Em andamento' : 'Sem pontuação';
}

function attemptAction(attempt: InvestigationHistoryItem): { to: string; label: string } {
  if (attempt.status === 'EM_ANDAMENTO') {
    return { to: `/investigacoes/${attempt.id}`, label: 'Continuar investigação' };
  }
  return {
    to: `/investigacoes/${attempt.id}/resultado`,
    label: attempt.status === 'ABANDONADO' ? 'Ver registro' : 'Ver relatório',
  };
}

function HistoryEntry({ attempt }: { attempt: InvestigationHistoryItem }) {
  const action = attemptAction(attempt);
  const statusModifier = attempt.status.toLowerCase().replace('_', '-');
  return (
    <article
      className={`history-entry history-entry--${statusModifier}`}
      aria-labelledby={`history-title-${attempt.id}`}
      data-testid={`history-item-${attempt.id}`}
    >
      <header className="history-entry__header">
        <div>
          <p className="history-entry__attempt" data-testid={`history-attempt-${attempt.id}`}>
            Tentativa nº {attempt.attemptNumber}
          </p>
          <h2 id={`history-title-${attempt.id}`} className="history-entry__title">
            {attempt.mission.title}
          </h2>
        </div>
        <div className="history-entry__badges">
          <DifficultyBadge
            difficulty={attempt.mission.difficulty}
            label={attempt.mission.difficultyLabel}
          />
          <StatusBadge status={attempt.status} testId={`history-status-${attempt.id}`} />
        </div>
      </header>

      <dl className="history-entry__facts">
        <div>
          <dt>Início</dt>
          <dd>{formatDateTime(attempt.startedAt)}</dd>
        </div>
        <div>
          <dt>Encerramento</dt>
          <dd>{attempt.finishedAt ? formatDateTime(attempt.finishedAt) : '—'}</dd>
        </div>
        <div>
          <dt>Evidências analisadas</dt>
          <dd>
            {attempt.analyzedEvidences} de {attempt.totalEvidences}
          </dd>
        </div>
        <div>
          <dt>Dicas usadas</dt>
          <dd>{attempt.hintsUsed}</dd>
        </div>
        <div>
          <dt>Pontuação</dt>
          <dd data-testid={`history-score-${attempt.id}`}>{formatScore(attempt)}</dd>
        </div>
        <div>
          <dt>Classificação</dt>
          <dd data-testid={`history-classification-${attempt.id}`}>
            {attempt.classification ?? '—'}
          </dd>
        </div>
      </dl>

      <Link
        to={action.to}
        className={`button button--small ${attempt.status === 'EM_ANDAMENTO' ? 'button--primary' : 'button--ghost'}`}
        data-testid={`history-action-${attempt.id}`}
      >
        {action.label}
      </Link>
    </article>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState<InvestigationHistoryItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    setLoadError(null);
    investigationsApi
      .listHistory()
      .then(setHistory)
      .catch((error: unknown) => setLoadError(getErrorMessage(error)));
  }, []);

  useEffect(loadHistory, [loadHistory]);

  return (
    <section aria-labelledby="history-title" data-testid="history-page">
      <header className="page-header">
        <p className="page-header__eyebrow">Arquivo pessoal</p>
        <h1 id="history-title" className="page-header__title">
          Meu histórico
        </h1>
        <p className="page-header__lead">
          Todas as suas tentativas, da mais recente para a mais antiga. Os registros ficam
          vinculados à sua conta e continuam disponíveis depois de sair e entrar novamente.
        </p>
      </header>

      {loadError && <ErrorAlert message={loadError} testId="history-error" onRetry={loadHistory} />}
      {!history && !loadError && <LoadingState message="Consultando seus arquivos..." />}

      {history && history.length === 0 && (
        <div className="history-empty" data-testid="history-empty">
          <span className="history-empty__icon" aria-hidden="true">
            <MagnifierIcon />
          </span>
          <h2 className="history-empty__title">Nenhuma investigação registrada</h2>
          <p>Quando você iniciar um caso, cada tentativa aparecerá aqui com seu resultado.</p>
          <Link to="/" className="button button--primary">
            Abrir o arquivo de casos
          </Link>
        </div>
      )}

      {history && history.length > 0 && (
        <ol className="history-list" data-testid="history-list">
          {history.map((attempt) => (
            <li key={attempt.id}>
              <HistoryEntry attempt={attempt} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
