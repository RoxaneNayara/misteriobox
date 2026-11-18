import { Schema, model } from 'mongoose';

export const DIFFICULTIES = ['FACIL', 'MEDIO', 'DIFICIL'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  FACIL: 'Fácil',
  MEDIO: 'Médio',
  DIFICIL: 'Difícil',
};

export interface Suspect {
  suspectId: string;
  name: string;
  role: string;
  description: string;
  testimony: string;
}

export interface Evidence {
  evidenceId: string;
  title: string;
  content: string;
  /** Evidências que precisam ser analisadas antes desta (RN03). */
  requires: string[];
}

export interface Hint {
  hintId: string;
  text: string;
  relatedEvidenceId: string;
}

/** Dados secretos: nunca enviados ao cliente antes da acusação. */
export interface MissionSolution {
  culpritSuspectId: string;
  decisiveEvidenceId: string;
  explanation: string;
}

export interface Mission {
  missionId: string;
  order: number;
  title: string;
  theme: string;
  synopsis: string;
  story: string;
  difficulty: Difficulty;
  suspects: Suspect[];
  evidences: Evidence[];
  hints: Hint[];
  solution: MissionSolution;
}

/** Missão como lida do banco sem os dados secretos. */
export type PublicMission = Omit<Mission, 'solution'>;

const suspectSchema = new Schema<Suspect>(
  {
    suspectId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    testimony: { type: String, required: true },
  },
  { _id: false },
);

const evidenceSchema = new Schema<Evidence>(
  {
    evidenceId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    requires: { type: [String], default: [] },
  },
  { _id: false },
);

const hintSchema = new Schema<Hint>(
  {
    hintId: { type: String, required: true },
    text: { type: String, required: true },
    relatedEvidenceId: { type: String, required: true },
  },
  { _id: false },
);

const solutionSchema = new Schema<MissionSolution>(
  {
    culpritSuspectId: { type: String, required: true },
    decisiveEvidenceId: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

const missionSchema = new Schema<Mission>({
  missionId: { type: String, required: true, unique: true },
  order: { type: Number, required: true },
  title: { type: String, required: true },
  theme: { type: String, required: true },
  synopsis: { type: String, required: true },
  story: { type: String, required: true },
  difficulty: { type: String, enum: DIFFICULTIES, required: true },
  suspects: { type: [suspectSchema], required: true },
  evidences: { type: [evidenceSchema], required: true },
  hints: { type: [hintSchema], required: true },
  solution: { type: solutionSchema, required: true, select: false },
});

export const MissionModel = model<Mission>('Mission', missionSchema);
