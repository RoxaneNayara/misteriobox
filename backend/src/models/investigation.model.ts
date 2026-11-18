import { Schema, model, type Types } from 'mongoose';

export const INVESTIGATION_STATUSES = [
  'EM_ANDAMENTO',
  'SOLUCIONADO',
  'NAO_SOLUCIONADO',
  'ABANDONADO',
] as const;
export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[number];

export const DETECTIVE_CLASSIFICATIONS = [
  'Detetive Mestre',
  'Investigador Experiente',
  'Detetive Aprendiz',
  'Investigação Inconclusiva',
] as const;
export type DetectiveClassification = (typeof DETECTIVE_CLASSIFICATIONS)[number];

export interface Accusation {
  suspectId: string;
  evidenceId: string;
  accusedAt: Date;
}

export interface Investigation {
  userId: Types.ObjectId;
  missionId: string;
  /** Número sequencial da tentativa do jogador nesta missão (1, 2, 3...). */
  attemptNumber: number;
  status: InvestigationStatus;
  analyzedEvidenceIds: string[];
  unlockedEvidenceIds: string[];
  usedHintIds: string[];
  accusation: Accusation | null;
  score: number | null;
  classification: DetectiveClassification | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type InvestigationRecord = Investigation & { _id: Types.ObjectId };

const accusationSchema = new Schema<Accusation>(
  {
    suspectId: { type: String, required: true },
    evidenceId: { type: String, required: true },
    accusedAt: { type: Date, required: true },
  },
  { _id: false },
);

const investigationSchema = new Schema<Investigation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    missionId: { type: String, required: true },
    attemptNumber: { type: Number, required: true, min: 1 },
    status: { type: String, enum: INVESTIGATION_STATUSES, required: true, default: 'EM_ANDAMENTO' },
    analyzedEvidenceIds: { type: [String], default: [] },
    unlockedEvidenceIds: { type: [String], default: [] },
    usedHintIds: { type: [String], default: [] },
    accusation: { type: accusationSchema, default: null },
    score: { type: Number, default: null },
    classification: { type: String, enum: DETECTIVE_CLASSIFICATIONS, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

/**
 * RN08: no máximo uma tentativa EM_ANDAMENTO por jogador e missão.
 * O índice parcial garante a regra no banco, inclusive em requisições simultâneas.
 */
investigationSchema.index(
  { userId: 1, missionId: 1 },
  {
    name: 'uniq_active_attempt_per_user_mission',
    unique: true,
    partialFilterExpression: { status: 'EM_ANDAMENTO' },
  },
);

/** Numeração sequencial e única das tentativas de cada jogador em cada missão. */
investigationSchema.index(
  { userId: 1, missionId: 1, attemptNumber: 1 },
  { name: 'uniq_attempt_number_per_user_mission', unique: true },
);

/** Consulta do histórico do jogador, da tentativa mais recente para a mais antiga. */
investigationSchema.index({ userId: 1, createdAt: -1 });

export const InvestigationModel = model<Investigation>('Investigation', investigationSchema);
