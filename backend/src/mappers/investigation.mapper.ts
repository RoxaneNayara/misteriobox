import type {
  DetectiveClassification,
  InvestigationRecord,
  InvestigationStatus,
} from '../models/investigation.model';
import {
  DIFFICULTY_LABELS,
  type Difficulty,
  type Evidence,
  type Mission,
  type PublicMission,
} from '../models/mission.model';
import { MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION } from '../services/evidence-rules';
import { SCORING_RULES } from '../services/scoring.service';
import { toSuspectView, type SuspectView } from './mission.mapper';

export type EvidenceState = 'ANALISADA' | 'DISPONIVEL' | 'BLOQUEADA';

export interface EvidenceReference {
  id: string;
  title: string;
}

export interface EvidenceView {
  id: string;
  title: string;
  state: EvidenceState;
  /** Conteúdo só é enviado depois que a evidência foi analisada. */
  content: string | null;
  requiredEvidences: EvidenceReference[];
  missingRequirements: EvidenceReference[];
}

export interface HintView {
  id: string;
  text: string;
  relatedEvidence: EvidenceReference;
}

export interface InvestigationProgressView {
  id: string;
  status: InvestigationStatus;
  mission: {
    id: string;
    title: string;
    theme: string;
    difficulty: Difficulty;
    difficultyLabel: string;
    story: string;
  };
  suspects: SuspectView[];
  evidences: EvidenceView[];
  hints: { used: HintView[]; total: number; remaining: number };
  progress: {
    analyzedEvidences: number;
    unlockedEvidences: number;
    totalEvidences: number;
    percentage: number;
    minimumForAccusation: number;
    canAccuse: boolean;
  };
  startedAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
}

export interface InvestigationResultView {
  investigationId: string;
  mission: { id: string; title: string; difficulty: Difficulty; difficultyLabel: string };
  status: InvestigationStatus;
  score: number | null;
  classification: DetectiveClassification | null;
  scoreBreakdown: {
    suspectPoints: number;
    evidenceBonus: number;
    hintPenalty: number;
  } | null;
  hintsUsed: number;
  analyzedEvidences: number;
  totalEvidences: number;
  accusation: {
    suspect: { id: string; name: string };
    evidence: EvidenceReference;
    accusedAt: Date;
  } | null;
  /** Revelada somente quando a investigação foi finalizada por acusação (RN08). */
  solution: {
    culprit: { id: string; name: string };
    decisiveEvidence: EvidenceReference;
    explanation: string;
  } | null;
  startedAt: Date;
  finishedAt: Date | null;
}

function findEvidence(mission: PublicMission, evidenceId: string): Evidence {
  const evidence = mission.evidences.find((item) => item.evidenceId === evidenceId);
  if (!evidence) {
    throw new Error(`Evidência ${evidenceId} não existe na missão ${mission.missionId}.`);
  }
  return evidence;
}

function toEvidenceReference(mission: PublicMission, evidenceId: string): EvidenceReference {
  return { id: evidenceId, title: findEvidence(mission, evidenceId).title };
}

function findSuspectName(mission: PublicMission, suspectId: string): string {
  return mission.suspects.find((suspect) => suspect.suspectId === suspectId)?.name ?? suspectId;
}

function resolveEvidenceState(
  evidenceId: string,
  investigation: InvestigationRecord,
): EvidenceState {
  if (investigation.analyzedEvidenceIds.includes(evidenceId)) return 'ANALISADA';
  if (investigation.unlockedEvidenceIds.includes(evidenceId)) return 'DISPONIVEL';
  return 'BLOQUEADA';
}

function toEvidenceView(
  evidence: Evidence,
  mission: PublicMission,
  investigation: InvestigationRecord,
): EvidenceView {
  const state = resolveEvidenceState(evidence.evidenceId, investigation);
  return {
    id: evidence.evidenceId,
    title: evidence.title,
    state,
    content: state === 'ANALISADA' ? evidence.content : null,
    requiredEvidences: evidence.requires.map((id) => toEvidenceReference(mission, id)),
    missingRequirements: evidence.requires
      .filter((id) => !investigation.analyzedEvidenceIds.includes(id))
      .map((id) => toEvidenceReference(mission, id)),
  };
}

export function toInvestigationProgressView(
  investigation: InvestigationRecord,
  mission: PublicMission,
): InvestigationProgressView {
  const analyzedCount = investigation.analyzedEvidenceIds.length;
  const totalEvidences = mission.evidences.length;
  const usedHints: HintView[] = mission.hints
    .filter((hint) => investigation.usedHintIds.includes(hint.hintId))
    .map((hint) => ({
      id: hint.hintId,
      text: hint.text,
      relatedEvidence: toEvidenceReference(mission, hint.relatedEvidenceId),
    }));

  return {
    id: investigation._id.toString(),
    status: investigation.status,
    mission: {
      id: mission.missionId,
      title: mission.title,
      theme: mission.theme,
      difficulty: mission.difficulty,
      difficultyLabel: DIFFICULTY_LABELS[mission.difficulty],
      story: mission.story,
    },
    suspects: mission.suspects.map(toSuspectView),
    evidences: mission.evidences.map((evidence) =>
      toEvidenceView(evidence, mission, investigation),
    ),
    hints: {
      used: usedHints,
      total: mission.hints.length,
      remaining: mission.hints.length - usedHints.length,
    },
    progress: {
      analyzedEvidences: analyzedCount,
      unlockedEvidences: investigation.unlockedEvidenceIds.length,
      totalEvidences,
      percentage: Math.round((analyzedCount / totalEvidences) * 100),
      minimumForAccusation: MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION,
      canAccuse:
        investigation.status === 'EM_ANDAMENTO' &&
        analyzedCount >= MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION,
    },
    startedAt: investigation.createdAt,
    updatedAt: investigation.updatedAt,
    finishedAt: investigation.finishedAt,
  };
}

export function toInvestigationResultView(
  investigation: InvestigationRecord,
  mission: Mission,
): InvestigationResultView {
  const { accusation } = investigation;
  const hintsUsed = investigation.usedHintIds.length;
  const isCorrectSuspect = accusation?.suspectId === mission.solution.culpritSuspectId;
  const isDecisiveEvidence = accusation?.evidenceId === mission.solution.decisiveEvidenceId;

  return {
    investigationId: investigation._id.toString(),
    mission: {
      id: mission.missionId,
      title: mission.title,
      difficulty: mission.difficulty,
      difficultyLabel: DIFFICULTY_LABELS[mission.difficulty],
    },
    status: investigation.status,
    score: investigation.score,
    classification: investigation.classification,
    scoreBreakdown: accusation
      ? {
          suspectPoints: isCorrectSuspect ? SCORING_RULES.correctSuspectPoints : 0,
          evidenceBonus:
            isCorrectSuspect && isDecisiveEvidence ? SCORING_RULES.decisiveEvidenceBonus : 0,
          hintPenalty: hintsUsed * SCORING_RULES.hintPenalty,
        }
      : null,
    hintsUsed,
    analyzedEvidences: investigation.analyzedEvidenceIds.length,
    totalEvidences: mission.evidences.length,
    accusation: accusation
      ? {
          suspect: {
            id: accusation.suspectId,
            name: findSuspectName(mission, accusation.suspectId),
          },
          evidence: toEvidenceReference(mission, accusation.evidenceId),
          accusedAt: accusation.accusedAt,
        }
      : null,
    solution: accusation
      ? {
          culprit: {
            id: mission.solution.culpritSuspectId,
            name: findSuspectName(mission, mission.solution.culpritSuspectId),
          },
          decisiveEvidence: toEvidenceReference(mission, mission.solution.decisiveEvidenceId),
          explanation: mission.solution.explanation,
        }
      : null,
    startedAt: investigation.createdAt,
    finishedAt: investigation.finishedAt,
  };
}
