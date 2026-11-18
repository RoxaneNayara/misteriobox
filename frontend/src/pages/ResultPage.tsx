import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { DifficultyBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import { ArrowLeftIcon, CheckIcon, CrossIcon } from '../components/Icons';
import { MissionCover } from '../components/MissionCover';
import type { DetectiveClassification, InvestigationResult } from '../types/api';
import { STATUS_LABELS, formatCaseNumber, formatDateTime } from '../utils/labels';

const CLASSIFICATION_STARS: Record<DetectiveClassification, number> = {
  'Detetive Mestre': 3,
  'Investigador Experiente': 2,
  'Detetive Aprendiz': 1,
  'Investigação Inconclusiva': 0,
};

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score }: { score: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - score / 100);
  return (
    <div className="score-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <circle className="score-ring__track" cx="60" cy="60" r={RING_RADIUS} />
        <circle
          className="score-ring__value"
          cx="60"
          cy="60"
          r={RING_RADIUS}
          strokeDasharray={RING_CIRCUMFERENCE}
          style={{ ['--ring-offset' as string]: offset }}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring__label">
        <span className="score__value" data-testid="result-score">
          {score}
        </span>
        <span className="score__max">de 100 pontos</span>
      </div>
    </div>
  );
}

function Verdict({ correct }: { correct: boolean }) {
  return (
    <span className={`verdict ${correct ? 'verdict--right' : 'verdict--wrong'}`}>
      {correct ? <CheckIcon /> : <CrossIcon />}
      {correct ? 'Correto' : 'Incorreto'}
    </span>
  );
}

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
  const stars = result.classification ? CLASSIFICATION_STARS[result.classification] : 0;
  const { accusation, solution } = result;

  return (
    <article
      className={`report report--${statusModifier}`}
      aria-labelledby="result-title"
      data-testid="result-page"
    >
      <header className="report__cover">
        <MissionCover missionId={result.mission.id} className="report__art" />
        <div className="report__cover-content">
          <p className="report__eyebrow">Relatório final · {formatCaseNumber(result.mission.id)}</p>
          <h1 id="result-title" className="report__title">
            {result.mission.title}
          </h1>
          <DifficultyBadge
            difficulty={result.mission.difficulty}
            label={result.mission.difficultyLabel}
          />
        </div>
        <p className={`report__stamp report__stamp--${statusModifier}`} data-testid="result-status">
          {STATUS_LABELS[result.status]}
        </p>
      </header>

      <div className="report__sheet">
        <div className="report__meta" aria-label="Dados do arquivo">
          <span>Classificação: confidencial</span>
          <span>Aberto em {formatDateTime(result.startedAt)}</span>
          {result.finishedAt && <span>Encerrado em {formatDateTime(result.finishedAt)}</span>}
        </div>

        {result.status === 'ABANDONADO' ? (
          <section className="report__section" data-testid="result-abandoned">
            <h2 className="report__heading">Investigação abandonada</h2>
            <p>
              Esta investigação foi abandonada
              {result.finishedAt ? ` em ${formatDateTime(result.finishedAt)}` : ''} e não recebeu
              pontuação. Evidências analisadas: {result.analyzedEvidences} de{' '}
              {result.totalEvidences}. Dicas usadas: {result.hintsUsed}.
            </p>
            <p className="report__redacted">
              A solução do caso é revelada somente para investigações encerradas por acusação.
            </p>
          </section>
        ) : (
          <>
            <section className="report__section report__score" aria-labelledby="score-title">
              <h2 id="score-title" className="visually-hidden">
                Pontuação
              </h2>
              <ScoreRing score={result.score ?? 0} />
              <div className="rank">
                <span className="rank__stars" aria-hidden="true">
                  {[1, 2, 3].map((star) => (
                    <span key={star} className={star <= stars ? 'is-lit' : ''}>
                      ★
                    </span>
                  ))}
                </span>
                <p className="rank__label">Patente concedida</p>
                <p className="classification" data-testid="result-classification">
                  {result.classification}
                </p>
                {result.scoreBreakdown && (
                  <dl className="ledger" data-testid="result-breakdown">
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
              </div>
            </section>

            {accusation && (
              <section className="report__section" aria-labelledby="accusation-summary-title">
                <h2 id="accusation-summary-title" className="report__heading">
                  Sua acusação
                </h2>
                <dl className="report__facts">
                  <div>
                    <dt>Suspeito selecionado</dt>
                    <dd>
                      <span data-testid="result-accused-suspect">{accusation.suspect.name}</span>
                      {solution && (
                        <Verdict correct={accusation.suspect.id === solution.culprit.id} />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Evidência apresentada</dt>
                    <dd>
                      <span data-testid="result-accused-evidence">{accusation.evidence.title}</span>
                      {solution && (
                        <Verdict
                          correct={accusation.evidence.id === solution.decisiveEvidence.id}
                        />
                      )}
                    </dd>
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

            {solution && (
              <section
                className="report__section report__solution"
                aria-labelledby="solution-title"
                data-testid="result-solution"
              >
                <h2 id="solution-title" className="report__heading">
                  A solução do caso
                </h2>
                <dl className="report__facts">
                  <div>
                    <dt>Responsável</dt>
                    <dd data-testid="result-culprit">{solution.culprit.name}</dd>
                  </div>
                  <div>
                    <dt>Evidência decisiva</dt>
                    <dd data-testid="result-decisive-evidence">
                      {solution.decisiveEvidence.title}
                    </dd>
                  </div>
                </dl>
                <p className="report__explanation" data-testid="result-explanation">
                  {solution.explanation}
                </p>
              </section>
            )}
          </>
        )}

        <footer className="report__footer">
          <span className="report__signature" aria-hidden="true">
            Agência MistérioBox
          </span>
          <Link to="/" className="button button--primary" data-testid="result-back-to-catalog">
            <ArrowLeftIcon /> Voltar ao catálogo de casos
          </Link>
        </footer>
      </div>
    </article>
  );
}
