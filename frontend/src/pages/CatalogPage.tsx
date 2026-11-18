import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { investigationsApi } from '../api/investigations.api';
import { missionsApi } from '../api/missions.api';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { ErrorAlert, LoadingState } from '../components/Feedback';
import type { MissionCatalogItem } from '../types/api';
import { formatCaseNumber } from '../utils/labels';

function actionLabel(mission: MissionCatalogItem): string {
  if (!mission.investigation) return 'Iniciar investigação';
  if (mission.investigation.status === 'EM_ANDAMENTO') return 'Continuar investigação';
  return 'Ver resultado';
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

  return (
    <section aria-labelledby="catalog-title">
      <header className="page-header">
        <p className="page-header__eyebrow">Arquivo central</p>
        <h1 id="catalog-title" className="page-header__title">
          Casos disponíveis
        </h1>
        <p className="page-header__lead">
          Escolha um dossiê, examine as evidências e aponte o responsável. Seu progresso é salvo
          automaticamente a cada ação.
        </p>
      </header>

      {actionError && <ErrorAlert message={actionError} testId="catalog-action-error" />}
      {loadError && <ErrorAlert message={loadError} testId="catalog-error" onRetry={loadCatalog} />}
      {!missions && !loadError && <LoadingState message="Abrindo o arquivo de casos..." />}

      {missions && (
        <ul className="mission-grid" data-testid="mission-list">
          {missions.map((mission) => (
            <li key={mission.id}>
              <article
                className="mission-card"
                aria-labelledby={`mission-title-${mission.id}`}
                data-testid={`mission-card-${mission.id}`}
              >
                <div className="mission-card__tab" aria-hidden="true">
                  {formatCaseNumber(mission.id)}
                </div>
                <div className="mission-card__header">
                  <DifficultyBadge
                    difficulty={mission.difficulty}
                    label={mission.difficultyLabel}
                    testId={`mission-difficulty-${mission.id}`}
                  />
                  <StatusBadge
                    status={mission.investigation?.status ?? null}
                    testId={`mission-status-${mission.id}`}
                  />
                </div>
                <h2
                  id={`mission-title-${mission.id}`}
                  className="mission-card__title"
                  data-testid={`mission-title-${mission.id}`}
                >
                  {mission.title}
                </h2>
                <p className="mission-card__theme">{mission.theme}</p>
                <p
                  className="mission-card__synopsis"
                  data-testid={`mission-synopsis-${mission.id}`}
                >
                  {mission.synopsis}
                </p>
                <dl className="mission-card__stats">
                  <div>
                    <dt>Evidências</dt>
                    <dd data-testid={`mission-evidence-count-${mission.id}`}>
                      {mission.totalEvidences}
                    </dd>
                  </div>
                  <div>
                    <dt>Suspeitos</dt>
                    <dd>{mission.totalSuspects}</dd>
                  </div>
                  <div>
                    <dt>Dicas</dt>
                    <dd>{mission.totalHints}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className={`button ${mission.investigation ? 'button--secondary' : 'button--primary'} button--block`}
                  onClick={() => handleAction(mission)}
                  disabled={startingMissionId !== null}
                  data-testid={`mission-action-${mission.id}`}
                >
                  {startingMissionId === mission.id ? 'Abrindo dossiê...' : actionLabel(mission)}
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
