import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { missionsApi } from '../api/missions.api';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import { DocumentIcon, LightbulbIcon, UsersIcon } from '../components/Icons';
import { MissionCover } from '../components/MissionCover';
import { useAuth } from '../context/auth-context';
import type { InvestigationHistoryItem, MissionCatalogItem } from '../types/api';
import { computeDetectiveStats } from '../utils/detective-stats';
import { formatCaseNumber, initialOf } from '../utils/labels';

function hasActiveAttempt(mission: MissionCatalogItem): boolean {
  return mission.investigation?.status === 'EM_ANDAMENTO';
}

function actionLabel(mission: MissionCatalogItem): string {
  if (!mission.investigation) return 'Iniciar investigação';
  if (hasActiveAttempt(mission)) return 'Continuar investigação';
  return 'Jogar novamente';
}

interface MissionCardProps {
  mission: MissionCatalogItem;
  index: number;
  isStarting: boolean;
  disabled: boolean;
  onAction: (mission: MissionCatalogItem) => void;
}

function MissionCard({ mission, index, isStarting, disabled, onAction }: MissionCardProps) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const synopsisId = `mission-synopsis-${mission.id}`;
  const status = mission.investigation?.status ?? null;

  return (
    <article
      className={`mission-card mission-card--${(status ?? 'nova').toLowerCase()}`}
      style={{ animationDelay: `${index * 90}ms` }}
      aria-labelledby={`mission-title-${mission.id}`}
      data-testid={`mission-card-${mission.id}`}
    >
      <div className="mission-card__cover">
        <MissionCover missionId={mission.id} />
        <span className="mission-card__case-number" aria-hidden="true">
          {formatCaseNumber(mission.id)}
        </span>
        <div className="mission-card__seals">
          <DifficultyBadge
            difficulty={mission.difficulty}
            label={mission.difficultyLabel}
            testId={`mission-difficulty-${mission.id}`}
          />
          <StatusBadge status={status} testId={`mission-status-${mission.id}`} />
        </div>
      </div>

      <div className="mission-card__body">
        <p className="mission-card__theme">{mission.theme}</p>
        <h2
          id={`mission-title-${mission.id}`}
          className="mission-card__title"
          data-testid={`mission-title-${mission.id}`}
        >
          {mission.title}
        </h2>
        <p
          id={synopsisId}
          className={`mission-card__synopsis ${synopsisExpanded ? 'is-expanded' : ''}`}
          data-testid={`mission-synopsis-${mission.id}`}
        >
          {mission.synopsis}
        </p>
        <button
          type="button"
          className="text-button"
          aria-expanded={synopsisExpanded}
          aria-controls={synopsisId}
          onClick={() => setSynopsisExpanded((expanded) => !expanded)}
        >
          {synopsisExpanded ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>

        <dl className="mission-card__stats">
          <div>
            <dt>
              <DocumentIcon /> Evidências
            </dt>
            <dd data-testid={`mission-evidence-count-${mission.id}`}>{mission.totalEvidences}</dd>
          </div>
          <div>
            <dt>
              <UsersIcon /> Suspeitos
            </dt>
            <dd>{mission.totalSuspects}</dd>
          </div>
          <div>
            <dt>
              <LightbulbIcon /> Dicas
            </dt>
            <dd>{mission.totalHints}</dd>
          </div>
        </dl>

        <button
          type="button"
          className={`button ${hasActiveAttempt(mission) ? 'button--secondary' : 'button--primary'} button--block`}
          onClick={() => onAction(mission)}
          disabled={disabled}
          data-testid={`mission-action-${mission.id}`}
        >
          {isStarting ? 'Abrindo dossiê...' : actionLabel(mission)}
        </button>
        {mission.investigation && !hasActiveAttempt(mission) && (
          <Link
            to={`/investigacoes/${mission.investigation.id}/resultado`}
            className="mission-card__secondary-link"
            data-testid={`mission-last-report-${mission.id}`}
          >
            Ver último relatório
          </Link>
        )}
        {mission.totalAttempts > 0 && (
          <p className="mission-card__attempts" data-testid={`mission-attempts-${mission.id}`}>
            {mission.totalAttempts}{' '}
            {mission.totalAttempts === 1 ? 'tentativa registrada' : 'tentativas registradas'}
          </p>
        )}
      </div>
    </article>
  );
}

export function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionCatalogItem[] | null>(null);
  const [history, setHistory] = useState<InvestigationHistoryItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingMissionId, setStartingMissionId] = useState<string | null>(null);

  const loadCatalog = useCallback(() => {
    setLoadError(null);
    Promise.all([missionsApi.list(), investigationsApi.listHistory()])
      .then(([catalog, attempts]) => {
        setMissions(catalog);
        setHistory(attempts);
      })
      .catch((error: unknown) => setLoadError(getErrorMessage(error)));
  }, []);

  useEffect(loadCatalog, [loadCatalog]);

  /** Continua a tentativa ativa ou inicia uma nova (primeira ou "jogar novamente"). */
  const handleAction = async (mission: MissionCatalogItem) => {
    setActionError(null);
    if (mission.investigation && hasActiveAttempt(mission)) {
      navigate(`/investigacoes/${mission.investigation.id}`);
      return;
    }
    setStartingMissionId(mission.id);
    try {
      const startedInvestigation = await investigationsApi.start(mission.id);
      navigate(`/investigacoes/${startedInvestigation.id}`);
    } catch (error) {
      setStartingMissionId(null);
      const existingId =
        error instanceof ApiError &&
        error.code === 'INVESTIGATION_ALREADY_EXISTS' &&
        (error.details as { investigationId?: string } | undefined)?.investigationId;
      if (existingId) {
        navigate(`/investigacoes/${existingId}`);
        return;
      }
      setActionError(getErrorMessage(error));
    }
  };

  const stats = missions && history ? computeDetectiveStats(missions, history) : null;

  return (
    <div className="agency">
      <section className="agency-hero" aria-labelledby="catalog-title">
        <div className="agency-hero__intro">
          <p className="page-header__eyebrow">Agência MistérioBox</p>
          <h1 id="catalog-title" className="agency-hero__title">
            Toda verdade deixa rastros.
          </h1>
          <p className="agency-hero__lead">
            Somos uma agência de investigação que reúne casos sem resposta. Examine evidências,
            confronte depoimentos e aponte o responsável — cada ação fica registrada no seu dossiê.
          </p>
        </div>

        <aside
          className="detective-panel"
          aria-labelledby="detective-panel-title"
          data-testid="detective-panel"
        >
          <div className="detective-panel__id">
            <span className="detective-panel__avatar" aria-hidden="true">
              {user ? initialOf(user.name) : ''}
            </span>
            <div>
              <p className="detective-panel__label">Credencial de detetive</p>
              <h2 id="detective-panel-title" className="detective-panel__name">
                {user?.name}
              </h2>
            </div>
          </div>
          <dl className="detective-panel__stats">
            <div>
              <dt>Casos disponíveis</dt>
              <dd data-testid="stat-available">{stats ? stats.availableCases : '—'}</dd>
            </div>
            <div>
              <dt>Em andamento</dt>
              <dd data-testid="stat-in-progress">{stats ? stats.casesInProgress : '—'}</dd>
            </div>
            <div>
              <dt>Solucionados</dt>
              <dd data-testid="stat-solved">{stats ? stats.solvedCases : '—'}</dd>
            </div>
          </dl>
          <Link to="/historico" className="detective-panel__link">
            Ver meu histórico completo
          </Link>
        </aside>
      </section>

      <section className="case-archive" aria-labelledby="archive-title">
        <header className="case-archive__header">
          <h2 id="archive-title" className="case-archive__title">
            Arquivo central de casos
          </h2>
          <p className="case-archive__lead">
            Escolha um dossiê. Casos encerrados podem ser investigados novamente; as tentativas
            anteriores continuam no seu histórico.
          </p>
        </header>

        {actionError && <ErrorAlert message={actionError} testId="catalog-action-error" />}
        {loadError && (
          <ErrorAlert message={loadError} testId="catalog-error" onRetry={loadCatalog} />
        )}
        {!missions && !loadError && <LoadingState message="Abrindo o arquivo de casos..." />}

        {missions && (
          <ul className="mission-grid" data-testid="mission-list">
            {missions.map((mission, index) => (
              <li key={mission.id}>
                <MissionCard
                  mission={mission}
                  index={index}
                  isStarting={startingMissionId === mission.id}
                  disabled={startingMissionId !== null}
                  onAction={handleAction}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
