import type { InvestigationRecord, InvestigationStatus } from '../models/investigation.model';
import {
  DIFFICULTY_LABELS,
  type Difficulty,
  type PublicMission,
  type Suspect,
} from '../models/mission.model';

export interface SuspectView {
  id: string;
  name: string;
  role: string;
  description: string;
  testimony: string;
}

export interface MissionSummaryView {
  id: string;
  title: string;
  theme: string;
  synopsis: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  totalEvidences: number;
  totalSuspects: number;
  totalHints: number;
}

export interface MissionCatalogItemView extends MissionSummaryView {
  /** Tentativa ativa do jogador ou, se não houver, a mais recente. */
  investigation: { id: string; status: InvestigationStatus } | null;
  totalAttempts: number;
}

export interface MissionDetailsView extends MissionSummaryView {
  story: string;
  suspects: SuspectView[];
}

export function toSuspectView(suspect: Suspect): SuspectView {
  return {
    id: suspect.suspectId,
    name: suspect.name,
    role: suspect.role,
    description: suspect.description,
    testimony: suspect.testimony,
  };
}

export function toMissionSummaryView(mission: PublicMission): MissionSummaryView {
  return {
    id: mission.missionId,
    title: mission.title,
    theme: mission.theme,
    synopsis: mission.synopsis,
    difficulty: mission.difficulty,
    difficultyLabel: DIFFICULTY_LABELS[mission.difficulty],
    totalEvidences: mission.evidences.length,
    totalSuspects: mission.suspects.length,
    totalHints: mission.hints.length,
  };
}

export function toMissionCatalogItemView(
  mission: PublicMission,
  investigation: InvestigationRecord | undefined,
  totalAttempts: number,
): MissionCatalogItemView {
  return {
    ...toMissionSummaryView(mission),
    investigation: investigation
      ? { id: investigation._id.toString(), status: investigation.status }
      : null,
    totalAttempts,
  };
}

export function toMissionDetailsView(mission: PublicMission): MissionDetailsView {
  return {
    ...toMissionSummaryView(mission),
    story: mission.story,
    suspects: mission.suspects.map(toSuspectView),
  };
}
