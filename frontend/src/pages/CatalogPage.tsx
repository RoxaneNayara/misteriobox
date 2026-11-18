import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { missionsApi } from '../api/missions.api';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import { DocumentIcon, LightbulbIcon, UsersIcon } from '../components/Icons';
import { MissionCover } from '../components/MissionCover';
import type { MissionCatalogItem } from '../types/api';
import { formatCaseNumber } from '../utils/labels';

function actionLabel(mission: MissionCatalogItem): string {
  if (!mission.investigation) return 'Iniciar investigação';
  if (mission.investigation.status === 'EM_ANDAMENTO') return 'Continuar investigação';
  return 'Ver resultado';
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
          className={`button ${mission.investigation ? 'button--secondary' : 'button--primary'} button--block`}
          onClick={() => onAction(mission)}
          disabled={disabled}
          data-testid={`mission-action-${mission.id}`}
        >
          {isStarting ? 'Abrindo dossiê...' : actionLabel(mission)}
        </button>
      </div>
    </article>
  );
}

export function CatalogPage() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<MissionCatalogItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingMissionId, setStartingMissionId] = useState<string | null>(null);

  const loadCatalog = useCallback(() => {
    setLoadError(null);
    missionsApi
      .list()
      .then(setMissions)
      .catch((error: unknown) => setLoadError(getErrorMessage(error)));
  }, []);

  useEffect(loadCatalog, [loadCatalog]);

  const handleAction = async (mission: MissionCatalogItem) => {
    setActionError(null);
    const { investigation } = mission;
    if (investigation) {
      navigate(
        investigation.status === 'EM_ANDAMENTO'
          ? `/investigacoes/${investigation.id}`
          : `/investigacoes/${investigation.id}/resultado`,
      );
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

  const activeCount =
    missions?.filter((mission) => mission.investigation?.status === 'EM_ANDAMENTO').length ?? 0;

  return (
    <section aria-labelledby="catalog-title">
      <header className="page-header page-header--hero">
        <p className="page-header__eyebrow">Arquivo central · Casos em aberto</p>
        <h1 id="catalog-title" className="page-header__title">
          Casos disponíveis
        </h1>
        <p className="page-header__lead">
          Escolha um dossiê, examine as evidências e aponte o responsável. Seu progresso é salvo a
          cada ação.
        </p>
        {missions && activeCount > 0 && (
          <p className="page-header__note">
            Você tem {activeCount} {activeCount === 1 ? 'investigação' : 'investigações'} em
            andamento.
          </p>
        )}
      </header>

      {actionError && <ErrorAlert message={actionError} testId="catalog-action-error" />}
      {loadError && <ErrorAlert message={loadError} testId="catalog-error" onRetry={loadCatalog} />}
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
  );
}
