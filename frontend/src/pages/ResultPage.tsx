import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { DifficultyBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import type { InvestigationResult } from '../types/api';
import { STATUS_LABELS, formatDateTime } from '../utils/labels';

export function ResultPage() {
  const { investigationId = '' } = useParams();
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const loadResult = useCallback(() => {
    setError(null);
    investigationsApi.getResult(investigationId).then(setResult).catch(setError);
  }, [investigationId]);

  useEffect(loadResult, [loadResult]);

  if (error) {
    const stillInProgress = error instanceof ApiError && error.code === 'INVESTIGATION_IN_PROGRESS';
    return (
      <section>
        <ErrorAlert
          message={getErrorMessage(error)}
          testId="result-error"
          onRetry={stillInProgress ? undefined : loadResult}
        />
        <Link
          to={stillInProgress ? `/investigacoes/${investigationId}` : '/'}
          className="button button--ghost"
        >
          {stillInProgress ? 'Voltar à investigação' : 'Voltar ao catálogo'}
        </Link>
      </section>
    );
  }
  if (!result) return <LoadingState message="Preparando o relatório final..." />;

  const statusModifier = result.status.toLowerCase().replace('_', '-');

  return (
    <article className="result" aria-labelledby="result-title" data-testid="result-page">
      <header className="result__header dossier">
        <p className="page-header__eyebrow">Relatório final</p>
        <h1 id="result-title" className="result__title">
          {result.mission.title}
        </h1>
        <DifficultyBadge
          difficulty={result.mission.difficulty}
          label={result.mission.difficultyLabel}
        />
        <p className={`result__stamp result__stamp--${statusModifier}`} data-testid="result-status">
          {STATUS_LABELS[result.status]}
        </p>
      </header>

      {result.status === 'ABANDONADO' ? (
        <section className="panel" data-testid="result-abandoned">
          <h2 className="panel__title">Investigação abandonada</h2>
          <p>
            Esta investigação foi abandonada
            {result.finishedAt ? ` em ${formatDateTime(result.finishedAt)}` : ''} e não recebeu
            pontuação. Evidências analisadas: {result.analyzedEvidences} de {result.totalEvidences}.
            Dicas usadas: {result.hintsUsed}.
          </p>
          <p>A solução do caso é revelada somente para investigações encerradas por acusação.</p>
        </section>
      ) : (
        <>
          <section className="panel result__score-panel" aria-labelledby="score-title">
            <h2 id="score-title" className="visually-hidden">
              Pontuação
            </h2>
            <div className="score">
              <span className="score__value" data-testid="result-score">
                {result.score}
              </span>
              <span className="score__max">/ 100 pontos</span>
            </div>
            <p className="classification" data-testid="result-classification">
              {result.classification}
            </p>
            {result.scoreBreakdown && (
              <dl className="breakdown" data-testid="result-breakdown">
                <div>
                  <dt>Suspeito correto</dt>
                  <dd>+{result.scoreBreakdown.suspectPoints}</dd>
                </div>
                <div>
                  <dt>Evidência decisiva</dt>
                  <dd>+{result.scoreBreakdown.evidenceBonus}</dd>
                </div>
                <div>
                  <dt>Dicas usadas ({result.hintsUsed})</dt>
                  <dd>−{result.scoreBreakdown.hintPenalty}</dd>
                </div>
              </dl>
            )}
          </section>

          {result.accusation && (
            <section className="panel" aria-labelledby="accusation-summary-title">
              <h2 id="accusation-summary-title" className="panel__title">
                Sua acusação
              </h2>
              <dl className="details-list">
                <div>
                  <dt>Suspeito selecionado</dt>
                  <dd data-testid="result-accused-suspect">{result.accusation.suspect.name}</dd>
                </div>
                <div>
                  <dt>Evidência apresentada</dt>
                  <dd data-testid="result-accused-evidence">{result.accusation.evidence.title}</dd>
                </div>
                <div>
                  <dt>Evidências analisadas</dt>
                  <dd>
                    {result.analyzedEvidences} de {result.totalEvidences}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {result.solution && (
            <section
              className="panel panel--solution dossier"
              aria-labelledby="solution-title"
              data-testid="result-solution"
            >
              <h2 id="solution-title" className="panel__title">
                A solução do caso
              </h2>
              <dl className="details-list">
                <div>
                  <dt>Responsável</dt>
                  <dd data-testid="result-culprit">{result.solution.culprit.name}</dd>
                </div>
                <div>
                  <dt>Evidência decisiva</dt>
                  <dd data-testid="result-decisive-evidence">
                    {result.solution.decisiveEvidence.title}
                  </dd>
                </div>
              </dl>
              <p className="solution__explanation" data-testid="result-explanation">
                {result.solution.explanation}
              </p>
            </section>
          )}
        </>
      )}

      <Link to="/" className="button button--primary" data-testid="result-back-to-catalog">
        Voltar ao catálogo de casos
      </Link>
    </article>
  );
}
