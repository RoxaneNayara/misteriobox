import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { investigationsApi } from '../../api/investigations.api';
import { DifficultyBadge, StatusBadge } from '../../components/Badges';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorAlert, LoadingState, StatusMessage } from '../../components/Feedback';
import { ProgressBar } from '../../components/ProgressBar';
import type { Evidence, InvestigationProgress } from '../../types/api';
import { formatDateTime } from '../../utils/labels';
import { AccusationForm, type AccusationDraft } from './AccusationForm';
import { EvidenceBoard } from './EvidenceBoard';
import { HintPanel } from './HintPanel';
import { SuspectList } from './SuspectList';

type PendingAction = 'analyze' | 'hint' | 'abandon' | 'accuse' | null;
type OpenDialog = 'hint' | 'abandon' | 'accuse' | null;

export function InvestigationPage() {
  const { investigationId = '' } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<InvestigationProgress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [analyzingEvidenceId, setAnalyzingEvidenceId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [accusationDraft, setAccusationDraft] = useState<AccusationDraft | null>(null);

  const loadInvestigation = useCallback(() => {
    setLoadError(null);
    investigationsApi
      .getProgress(investigationId)
      .then(setInvestigation)
      .catch((error: unknown) => setLoadError(getErrorMessage(error)));
  }, [investigationId]);

  useEffect(loadInvestigation, [loadInvestigation]);

  /** Executa uma ação na API; o estado exibido sempre vem da resposta do servidor. */
  const runAction = async (
    action: Exclude<PendingAction, null>,
    request: () => Promise<InvestigationProgress>,
    message: string,
  ) => {
    setPendingAction(action);
    setActionError(null);
    setSuccessMessage(null);
    try {
      setInvestigation(await request());
      setSuccessMessage(message);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingAction(null);
      setAnalyzingEvidenceId(null);
      setOpenDialog(null);
    }
  };

  const handleAnalyze = (evidence: Evidence) => {
    setAnalyzingEvidenceId(evidence.id);
    void runAction(
      'analyze',
      () => investigationsApi.analyzeEvidence(investigationId, evidence.id),
      `Evidência "${evidence.title}" analisada. Progresso salvo.`,
    );
  };

  const handleConfirmHint = () =>
    runAction(
      'hint',
      () => investigationsApi.useHint(investigationId),
      'Nova dica revelada. Progresso salvo.',
    );

  const handleConfirmAbandon = () =>
    runAction(
      'abandon',
      () => investigationsApi.abandon(investigationId),
      'Investigação abandonada.',
    );

  const handleConfirmAccusation = async () => {
    if (!accusationDraft) return;
    setPendingAction('accuse');
    setActionError(null);
    try {
      await investigationsApi.accuse(
        investigationId,
        accusationDraft.suspect.id,
        accusationDraft.evidence.id,
      );
      navigate(`/investigacoes/${investigationId}/resultado`, { replace: true });
    } catch (error) {
      setActionError(getErrorMessage(error));
      setPendingAction(null);
      setOpenDialog(null);
    }
  };

  if (loadError) {
    return (
      <section>
        <ErrorAlert
          message={loadError}
          testId="investigation-load-error"
          onRetry={loadInvestigation}
        />
        <Link to="/" className="button button--ghost">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }
  if (!investigation) return <LoadingState message="Abrindo o dossiê da investigação..." />;

  // Investigações finalizadas (RN08) não aceitam ações: mostramos o resultado.
  if (investigation.status !== 'EM_ANDAMENTO') {
    return <Navigate to={`/investigacoes/${investigation.id}/resultado`} replace />;
  }

  const isBusy = pendingAction !== null;
  const { mission, progress } = investigation;

  return (
    <article
      className="investigation"
      aria-labelledby="investigation-title"
      data-testid="investigation-page"
    >
      <header className="investigation__header dossier">
        <p className="dossier__stamp" aria-hidden="true">
          Confidencial
        </p>
        <div className="investigation__badges">
          <DifficultyBadge difficulty={mission.difficulty} label={mission.difficultyLabel} />
          <StatusBadge status={investigation.status} testId="investigation-status" />
        </div>
        <h1
          id="investigation-title"
          className="investigation__title"
          data-testid="investigation-title"
        >
          {mission.title}
        </h1>
        <p className="investigation__theme">{mission.theme}</p>
        <ProgressBar
          value={progress.analyzedEvidences}
          max={progress.totalEvidences}
          label="Evidências analisadas"
          testId="investigation-progress"
        />
        <p className="investigation__saved" data-testid="autosave-indicator">
          Progresso salvo automaticamente em {formatDateTime(investigation.updatedAt)}.
        </p>
        <div className="investigation__actions">
          <Link to="/" className="button button--ghost" data-testid="investigation-exit">
            Sair e continuar depois
          </Link>
          <button
            type="button"
            className="button button--danger-outline"
            onClick={() => setOpenDialog('abandon')}
            disabled={isBusy}
            data-testid="investigation-abandon"
          >
            Abandonar missão
          </button>
        </div>
      </header>

      {actionError && <ErrorAlert message={actionError} testId="investigation-action-error" />}
      <StatusMessage message={successMessage} testId="investigation-feedback" />

      <section className="panel" aria-labelledby="story-title">
        <h2 id="story-title" className="panel__title">
          O caso
        </h2>
        <p className="story" data-testid="investigation-story">
          {mission.story}
        </p>
      </section>

      <section className="panel" aria-labelledby="suspects-title">
        <h2 id="suspects-title" className="panel__title">
          Suspeitos e depoimentos
        </h2>
        <SuspectList suspects={investigation.suspects} />
      </section>

      <section className="panel" aria-labelledby="evidences-title">
        <h2 id="evidences-title" className="panel__title">
          Evidências
        </h2>
        <p className="panel__lead">
          Disponíveis: {progress.unlockedEvidences - progress.analyzedEvidences} · Analisadas:{' '}
          {progress.analyzedEvidences} · Bloqueadas:{' '}
          {progress.totalEvidences - progress.unlockedEvidences}
        </p>
        <EvidenceBoard
          evidences={investigation.evidences}
          disabled={isBusy}
          analyzingEvidenceId={analyzingEvidenceId}
          onAnalyze={handleAnalyze}
        />
      </section>

      <section className="panel" aria-labelledby="hints-title">
        <h2 id="hints-title" className="panel__title">
          Dicas
        </h2>
        <HintPanel
          hints={investigation.hints}
          disabled={isBusy}
          onRequestHint={() => setOpenDialog('hint')}
        />
      </section>

      <section className="panel panel--accusation" aria-labelledby="accusation-title">
        <h2 id="accusation-title" className="panel__title">
          Acusação
        </h2>
        <p className="panel__lead">
          Você tem direito a uma única acusação. Depois dela, a investigação é encerrada e a solução
          é revelada.
        </p>
        <AccusationForm
          investigation={investigation}
          disabled={isBusy}
          onSubmit={(draft) => {
            setAccusationDraft(draft);
            setOpenDialog('accuse');
          }}
        />
      </section>

      <ConfirmDialog
        open={openDialog === 'hint'}
        title="Consultar dica?"
        confirmLabel="Ver dica"
        busy={pendingAction === 'hint'}
        testId="hint-dialog"
        onConfirm={handleConfirmHint}
        onCancel={() => setOpenDialog(null)}
      >
        <p>Cada dica utilizada desconta 10 pontos da sua pontuação final. Deseja continuar?</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={openDialog === 'abandon'}
        title="Abandonar a missão?"
        confirmLabel="Abandonar definitivamente"
        cancelLabel="Continuar investigando"
        tone="danger"
        busy={pendingAction === 'abandon'}
        testId="abandon-dialog"
        onConfirm={handleConfirmAbandon}
        onCancel={() => setOpenDialog(null)}
      >
        <p>
          Ao abandonar, a investigação recebe o status <strong>Abandonado</strong>, você não recebe
          pontuação e não poderá retomá-la. A solução do caso não será revelada.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={openDialog === 'accuse'}
        title="Confirmar acusação definitiva?"
        confirmLabel="Confirmar acusação"
        tone="danger"
        busy={pendingAction === 'accuse'}
        testId="accusation-dialog"
        onConfirm={handleConfirmAccusation}
        onCancel={() => setOpenDialog(null)}
      >
        {accusationDraft && (
          <p>
            Você vai acusar <strong>{accusationDraft.suspect.name}</strong> com base na evidência{' '}
            <strong>{accusationDraft.evidence.title}</strong>. Esta ação não pode ser desfeita.
          </p>
        )}
      </ConfirmDialog>
    </article>
  );
}
