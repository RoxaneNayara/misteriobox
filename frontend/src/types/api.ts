export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export type InvestigationStatus = 'EM_ANDAMENTO' | 'SOLUCIONADO' | 'NAO_SOLUCIONADO' | 'ABANDONADO';

export type EvidenceState = 'ANALISADA' | 'DISPONIVEL' | 'BLOQUEADA';

export type DetectiveClassification =
  'Detetive Mestre' | 'Investigador Experiente' | 'Detetive Aprendiz' | 'Investigação Inconclusiva';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  tokenType: 'Bearer';
  /** Segundos até este token expirar. */
  expiresIn: number;
  /** Tempo de inatividade permitido antes de exigir novo login. */
  idleTimeoutSeconds: number;
  /** Expiração absoluta da sessão (ISO 8601). */
  sessionExpiresAt: string;
  user: User;
}

export interface MissionCatalogItem {
  id: string;
  title: string;
  theme: string;
  synopsis: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  totalEvidences: number;
  totalSuspects: number;
  totalHints: number;
  /** Tentativa ativa do jogador ou, se não houver, a mais recente. */
  investigation: { id: string; status: InvestigationStatus } | null;
  totalAttempts: number;
}

/** Registro do histórico: `score`/`classification` são `null` quando não houve pontuação. */
export interface InvestigationHistoryItem {
  id: string;
  mission: { id: string; title: string; difficulty: Difficulty; difficultyLabel: string };
  attemptNumber: number;
  status: InvestigationStatus;
  startedAt: string;
  finishedAt: string | null;
  analyzedEvidences: number;
  totalEvidences: number;
  hintsUsed: number;
  score: number | null;
  classification: DetectiveClassification | null;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  testimony: string;
}

export interface EvidenceReference {
  id: string;
  title: string;
}

export interface Evidence {
  id: string;
  title: string;
  state: EvidenceState;
  content: string | null;
  requiredEvidences: EvidenceReference[];
  missingRequirements: EvidenceReference[];
}

export interface Hint {
  id: string;
  text: string;
  relatedEvidence: EvidenceReference;
}

export interface InvestigationProgress {
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
  suspects: Suspect[];
  evidences: Evidence[];
  hints: { used: Hint[]; total: number; remaining: number };
  progress: {
    analyzedEvidences: number;
    unlockedEvidences: number;
    totalEvidences: number;
    percentage: number;
    minimumForAccusation: number;
    canAccuse: boolean;
  };
  startedAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export interface InvestigationResult {
  investigationId: string;
  mission: { id: string; title: string; difficulty: Difficulty; difficultyLabel: string };
  status: InvestigationStatus;
  score: number | null;
  classification: DetectiveClassification | null;
  scoreBreakdown: { suspectPoints: number; evidenceBonus: number; hintPenalty: number } | null;
  hintsUsed: number;
  analyzedEvidences: number;
  totalEvidences: number;
  accusation: {
    suspect: { id: string; name: string };
    evidence: EvidenceReference;
    accusedAt: string;
  } | null;
  /** A solução só é enviada pela API quando a pontuação alcança `solutionRevealMinScore`. */
  solutionRevealed: boolean;
  solutionRevealMinScore: number;
  solution: {
    culprit: { id: string; name: string };
    decisiveEvidence: EvidenceReference;
    explanation: string;
  } | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface ValidationIssue {
  field: string;
  message: string;
}
