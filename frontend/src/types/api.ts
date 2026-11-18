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
  expiresIn: number;
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
  investigation: { id: string; status: InvestigationStatus } | null;
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
