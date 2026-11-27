import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { investigationsApi } from '../../api/investigations.api';
import { DifficultyBadge, StatusBadge } from '../../components/Badges';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorAlert, LoadingState } from '../../components/Feedback';
import { ArrowLeftIcon, ClockIcon, FlagIcon } from '../../components/Icons';
import { MissionCover } from '../../components/MissionCover';
import { Toast } from '../../components/Toast';
import { ProgressBar } from '../../components/ProgressBar';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useCssHeightVariable } from '../../hooks/useCssHeightVariable';
import { useScrollableNav } from '../../hooks/useScrollableNav';
import { useToast } from '../../hooks/useToast';
import type { Evidence, InvestigationProgress } from '../../types/api';
import { formatCaseNumber, formatDateTime } from '../../utils/labels';
import { AccusationForm, type AccusationDraft } from './AccusationForm';
import { EvidenceBoard } from './EvidenceBoard';
import { HintPanel } from './HintPanel';
import { SuspectList } from './SuspectList';

type PendingAction = 'analyze' | 'hint' | 'abandon' | 'accuse' | null;
type OpenDialog = 'hint' | 'abandon' | 'accuse' | null;

const CASE_SECTIONS = [
  { id: 'secao-caso', label: 'O caso' },
  { id: 'secao-suspeitos', label: 'Suspeitos' },
  { id: 'secao-evidencias', label: 'Evidências' },
  { id: 'secao-dicas', label: 'Dicas' },
  { id: 'secao-acusacao', label: 'Acusação' },
] as const;

const CASE_SECTION_IDS = CASE_SECTIONS.map((section) => section.id);
const SECTION_SCROLL_ANIMATION_MS = 1200;

export function InvestigationPage() {
  const { investigationId = '' } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<InvestigationProgress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Confirmações de sucesso: notificação temporária (some em ~4 s; ver useToast).
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [analyzingEvidenceId, setAnalyzingEvidenceId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [accusationDraft, setAccusationDraft] = useState<AccusationDraft | null>(null);

  // B05: altura real do menu fixo e destaque da seção em exibição.
  const caseNavRef = useRef<HTMLElement>(null);
  const showsCaseNav = investigation?.status === 'EM_ANDAMENTO';
  useCssHeightVariable(caseNavRef, '--case-nav-height', showsCaseNav);
  const { activeId: activeSectionId, select: selectSection } = useActiveSection(
    CASE_SECTION_IDS,
    showsCaseNav,
  );
  // Em telas estreitas o menu é uma faixa única com rolagem horizontal.
  const caseNavListRef = useRef<HTMLUListElement>(null);
  const caseNavEdges = useScrollableNav(
    caseNavListRef,
    'a[aria-current="location"]',
    activeSectionId,
    showsCaseNav,
  );

  /**
   * Leva à seção escolhida mesmo que a âncora já esteja na URL, respeitando a
   * preferência de movimento reduzido, e move o foco para a seção (teclado e
   * leitores de tela continuam a partir dela).
   */
  const lastSectionJumpAt = useRef(0);
  const goToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    selectSection(sectionId);
    const now = Date.now();
    // Um novo clique durante a animação anterior salta direto: a última escolha prevalece.
    const jumpInProgress = now - lastSectionJumpAt.current < SECTION_SCROLL_ANIMATION_MS;
    lastSectionJumpAt.current = now;
    // O foco vem antes da rolagem: no Chromium, focar durante uma rolagem suave a interrompe.
    section.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${sectionId}`);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({
      behavior: reduceMotion || jumpInProgress ? 'instant' : 'smooth',
      block: 'start',
    });
  };

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
    try {
      setInvestigation(await request());
      showToast(message);
    } catch (error) {
      // Uma confirmação anterior não deve continuar visível ao lado de um erro.
      dismissToast();
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
      <header className="case-hero">
        <div className="case-hero__cover">
          <MissionCover missionId={mission.id} />
        </div>
        <div className="case-hero__content">
          <p className="case-hero__eyebrow">
            {formatCaseNumber(mission.id)} · Arquivo confidencial
          </p>
          <h1
            id="investigation-title"
            className="case-hero__title"
            data-testid="investigation-title"
          >
            {mission.title}
          </h1>
          <p className="case-hero__theme">{mission.theme}</p>
          <div className="case-hero__badges">
            <DifficultyBadge difficulty={mission.difficulty} label={mission.difficultyLabel} />
            <StatusBadge status={investigation.status} testId="investigation-status" />
          </div>
          <ProgressBar
            value={progress.analyzedEvidences}
            max={progress.totalEvidences}
            label="Evidências analisadas"
            testId="investigation-progress"
          />
          <p className="case-hero__saved" data-testid="autosave-indicator">
            <ClockIcon /> Progresso salvo automaticamente em{' '}
            {formatDateTime(investigation.updatedAt)}.
          </p>
          <div className="case-hero__actions">
            <Link to="/" className="button button--ghost" data-testid="investigation-exit">
              <ArrowLeftIcon /> Sair e continuar depois
            </Link>
            <button
              type="button"
              className="button button--danger-outline"
              onClick={() => setOpenDialog('abandon')}
              disabled={isBusy}
              data-testid="investigation-abandon"
            >
              <FlagIcon /> Abandonar missão
            </button>
          </div>
        </div>
      </header>

      <nav
        ref={caseNavRef}
        className={[
          'case-nav',
          caseNavEdges.canScrollStart ? 'case-nav--more-start' : '',
          caseNavEdges.canScrollEnd ? 'case-nav--more-end' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Seções do dossiê"
        data-testid="case-nav"
      >
        <ul ref={caseNavListRef} className="case-nav__list" data-testid="case-nav-list">
          {CASE_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeSectionId === section.id ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  goToSection(section.id);
                }}
                data-testid={`case-nav-${section.id}`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Logo abaixo do menu: a notificação acompanha o menu fixo durante a rolagem. */}
      <Toast toast={toast} onDismiss={dismissToast} testId="investigation-feedback" />

      {actionError && <ErrorAlert message={actionError} testId="investigation-action-error" />}

      <section id="secao-caso" tabIndex={-1} className="case-section" aria-labelledby="story-title">
        <h2 id="story-title" className="case-section__title">
          <span className="case-section__index" aria-hidden="true">
            I
          </span>
          O caso
        </h2>
        <div className="briefing">
          <span className="briefing__clip" aria-hidden="true" />
          <p className="briefing__label">Relatório preliminar</p>
          <p className="briefing__text" data-testid="investigation-story">
            {mission.story}
          </p>
        </div>
      </section>

      <section
        id="secao-suspeitos"
        tabIndex={-1}
        className="case-section"
        aria-labelledby="suspects-title"
      >
        <h2 id="suspects-title" className="case-section__title">
          <span className="case-section__index" aria-hidden="true">
            II
          </span>
          Suspeitos e depoimentos
        </h2>
        <SuspectList suspects={investigation.suspects} />
      </section>

      <section
        id="secao-evidencias"
        tabIndex={-1}
        className="case-section"
        aria-labelledby="evidences-title"
      >
        <h2 id="evidences-title" className="case-section__title">
          <span className="case-section__index" aria-hidden="true">
            III
          </span>
          Evidências
        </h2>
        <ul className="evidence-summary" aria-label="Resumo das evidências">
          <li className="evidence-summary__item evidence-summary__item--available">
            <strong>{progress.unlockedEvidences - progress.analyzedEvidences}</strong> disponíveis
          </li>
          <li className="evidence-summary__item evidence-summary__item--analyzed">
            <strong>{progress.analyzedEvidences}</strong> analisadas
          </li>
          <li className="evidence-summary__item evidence-summary__item--locked">
            <strong>{progress.totalEvidences - progress.unlockedEvidences}</strong> bloqueadas
          </li>
        </ul>
        <EvidenceBoard
          evidences={investigation.evidences}
          disabled={isBusy}
          analyzingEvidenceId={analyzingEvidenceId}
          onAnalyze={handleAnalyze}
        />
      </section>

      <section
        id="secao-dicas"
        tabIndex={-1}
        className="case-section"
        aria-labelledby="hints-title"
      >
        <h2 id="hints-title" className="case-section__title">
          <span className="case-section__index" aria-hidden="true">
            IV
          </span>
          Notas do informante
        </h2>
        <HintPanel
          hints={investigation.hints}
          disabled={isBusy}
          onRequestHint={() => setOpenDialog('hint')}
        />
      </section>

      <section
        id="secao-acusacao"
        tabIndex={-1}
        className="case-section case-section--warrant"
        aria-labelledby="accusation-title"
      >
        <h2 id="accusation-title" className="case-section__title">
          <span className="case-section__index" aria-hidden="true">
            V
          </span>
          Acusação
        </h2>
        <p className="case-section__lead">
          Você tem direito a uma única acusação. Depois dela, a investigação é encerrada. A solução
          do caso só é revelada no relatório se você alcançar 50 pontos ou mais.
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
