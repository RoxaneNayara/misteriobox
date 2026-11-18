import { HttpErrors, type AppError } from '../errors/app-error';
import { isDuplicateKeyError } from '../errors/database-errors';
import {
  toInvestigationHistoryItemView,
  toInvestigationProgressView,
  toInvestigationResultView,
  type InvestigationHistoryItemView,
  type InvestigationProgressView,
  type InvestigationResultView,
} from '../mappers/investigation.mapper';
import type { InvestigationRecord } from '../models/investigation.model';
import type { Mission, PublicMission } from '../models/mission.model';
import { investigationRepository } from '../repositories/investigation.repository';
import { missionRepository } from '../repositories/mission.repository';
import {
  MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION,
  computeUnlockedEvidenceIds,
  findMissingRequirements,
} from './evidence-rules';
import { calculateScore, classifyDetective } from './scoring.service';

export interface AccusationInput {
  suspectId: string;
  evidenceId: string;
}

/** RN01: a investigação precisa existir e pertencer ao jogador autenticado. */
async function loadOwnedInvestigation(
  userId: string,
  investigationId: string,
): Promise<InvestigationRecord> {
  const investigation = await investigationRepository.findById(investigationId);
  if (!investigation) {
    throw HttpErrors.notFound('INVESTIGATION_NOT_FOUND', 'Investigação não encontrada.');
  }
  if (investigation.userId.toString() !== userId) {
    throw HttpErrors.forbidden('Esta investigação pertence a outro jogador.');
  }
  return investigation;
}

/** Tentativas de criação antes de desistir de uma corrida de numeração. */
const MAX_START_ATTEMPTS = 3;

/** RN08: uma investigação encerrada não pode receber novas ações. */
function ensureInProgress(investigation: InvestigationRecord): void {
  if (investigation.status !== 'EM_ANDAMENTO') {
    throw HttpErrors.conflict(
      'INVESTIGATION_FINISHED',
      'Esta investigação já foi finalizada e não aceita novas ações.',
      { status: investigation.status },
    );
  }
}

async function loadPublicMission(missionId: string): Promise<PublicMission> {
  const mission = await missionRepository.findById(missionId);
  if (!mission) {
    throw HttpErrors.notFound('MISSION_NOT_FOUND', 'Missão não encontrada.');
  }
  return mission;
}

async function loadMissionWithSolution(missionId: string): Promise<Mission> {
  const mission = await missionRepository.findByIdWithSolution(missionId);
  if (!mission) {
    throw HttpErrors.notFound('MISSION_NOT_FOUND', 'Missão não encontrada.');
  }
  return mission;
}

function activeInvestigationConflict(activeInvestigation: InvestigationRecord): AppError {
  return HttpErrors.conflict(
    'INVESTIGATION_ALREADY_EXISTS',
    'Você já possui uma investigação em andamento para esta missão. Continue a investigação existente.',
    { investigationId: activeInvestigation._id.toString(), status: activeInvestigation.status },
  );
}

function ensureUpdated(updatedInvestigation: InvestigationRecord | null): InvestigationRecord {
  if (!updatedInvestigation) {
    throw HttpErrors.conflict(
      'CONCURRENT_UPDATE',
      'A investigação foi alterada por outra ação. Recarregue o progresso e tente novamente.',
    );
  }
  return updatedInvestigation;
}

export const investigationService = {
  /**
   * RN08: inicia uma nova tentativa da missão. Tentativas anteriores nunca são
   * reabertas nem alteradas; só pode haver uma tentativa EM_ANDAMENTO por missão.
   */
  async start(userId: string, missionId: string): Promise<InvestigationProgressView> {
    const mission = await loadPublicMission(missionId);
    const unlockedEvidenceIds = computeUnlockedEvidenceIds(mission.evidences, []);

    for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt += 1) {
      const activeInvestigation = await investigationRepository.findActiveByUserAndMission(
        userId,
        missionId,
      );
      if (activeInvestigation) {
        throw activeInvestigationConflict(activeInvestigation);
      }
      const attemptNumber =
        (await investigationRepository.findLatestAttemptNumber(userId, missionId)) + 1;
      try {
        const createdInvestigation = await investigationRepository.create({
          userId,
          missionId,
          attemptNumber,
          unlockedEvidenceIds,
        });
        return toInvestigationProgressView(createdInvestigation, mission);
      } catch (error) {
        // Corrida com outra requisição: o índice único recusou a criação.
        // Na próxima volta, ou a tentativa ativa criada pela outra requisição é
        // encontrada (409), ou o número da tentativa é recalculado.
        if (!isDuplicateKeyError(error)) throw error;
      }
    }
    throw HttpErrors.conflict(
      'CONCURRENT_UPDATE',
      'Não foi possível iniciar a investigação por causa de requisições simultâneas. Tente novamente.',
    );
  },

  /** Histórico do jogador autenticado (RN01: somente as próprias tentativas). */
  async listHistory(userId: string): Promise<InvestigationHistoryItemView[]> {
    const [investigations, missions] = await Promise.all([
      investigationRepository.findByUserId(userId),
      missionRepository.findAll(),
    ]);
    const missionsById = new Map(missions.map((mission) => [mission.missionId, mission]));
    return investigations.flatMap((investigation) => {
      const mission = missionsById.get(investigation.missionId);
      return mission ? [toInvestigationHistoryItemView(investigation, mission)] : [];
    });
  },

  async getProgress(userId: string, investigationId: string): Promise<InvestigationProgressView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    const mission = await loadPublicMission(investigation.missionId);
    return toInvestigationProgressView(investigation, mission);
  },

  /** RN03 + RN06: valida o desbloqueio, registra a análise e salva o progresso. */
  async analyzeEvidence(
    userId: string,
    investigationId: string,
    evidenceId: string,
  ): Promise<InvestigationProgressView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    ensureInProgress(investigation);
    const mission = await loadPublicMission(investigation.missionId);

    const evidence = mission.evidences.find((item) => item.evidenceId === evidenceId);
    if (!evidence) {
      throw HttpErrors.notFound('EVIDENCE_NOT_FOUND', 'Evidência não encontrada nesta missão.');
    }
    if (investigation.analyzedEvidenceIds.includes(evidenceId)) {
      throw HttpErrors.conflict('EVIDENCE_ALREADY_ANALYZED', 'Esta evidência já foi analisada.');
    }
    const missingRequirements = findMissingRequirements(
      evidence,
      investigation.analyzedEvidenceIds,
    );
    if (missingRequirements.length > 0) {
      throw HttpErrors.businessRule(
        'EVIDENCE_LOCKED',
        'Esta evidência está bloqueada. Analise primeiro as evidências exigidas.',
        { missingRequirements },
      );
    }

    const analyzedEvidenceIds = [...investigation.analyzedEvidenceIds, evidenceId];
    const updatedInvestigation = await investigationRepository.updateIfInProgress(
      investigation._id,
      {
        $set: {
          analyzedEvidenceIds,
          unlockedEvidenceIds: computeUnlockedEvidenceIds(mission.evidences, analyzedEvidenceIds),
        },
      },
      { analyzedEvidenceIds: { $ne: evidenceId } },
    );
    return toInvestigationProgressView(ensureUpdated(updatedInvestigation), mission);
  },

  /** Revela a próxima dica disponível. Cada dica custa pontos na resolução (RN05). */
  async useHint(userId: string, investigationId: string): Promise<InvestigationProgressView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    ensureInProgress(investigation);
    const mission = await loadPublicMission(investigation.missionId);

    const nextHint = mission.hints.find((hint) => !investigation.usedHintIds.includes(hint.hintId));
    if (!nextHint) {
      throw HttpErrors.conflict(
        'NO_HINTS_REMAINING',
        'Todas as dicas desta missão já foram utilizadas.',
      );
    }
    const updatedInvestigation = await investigationRepository.updateIfInProgress(
      investigation._id,
      { $push: { usedHintIds: nextHint.hintId } },
      { usedHintIds: { $ne: nextHint.hintId } },
    );
    return toInvestigationProgressView(ensureUpdated(updatedInvestigation), mission);
  },

  /** RN07: abandono voluntário — sem pontuação e sem possibilidade de retomada. */
  async abandon(userId: string, investigationId: string): Promise<InvestigationProgressView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    ensureInProgress(investigation);
    const mission = await loadPublicMission(investigation.missionId);

    const updatedInvestigation = await investigationRepository.updateIfInProgress(
      investigation._id,
      { $set: { status: 'ABANDONADO', finishedAt: new Date(), score: null, classification: null } },
    );
    return toInvestigationProgressView(ensureUpdated(updatedInvestigation), mission);
  },

  /** RN04 + RN05 + RN08: acusação única, pontuação calculada no servidor. */
  async accuse(
    userId: string,
    investigationId: string,
    input: AccusationInput,
  ): Promise<InvestigationResultView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    ensureInProgress(investigation);
    const mission = await loadMissionWithSolution(investigation.missionId);

    if (investigation.analyzedEvidenceIds.length < MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION) {
      throw HttpErrors.businessRule(
        'INSUFFICIENT_EVIDENCES',
        `Analise pelo menos ${MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION} evidências antes de acusar.`,
        {
          analyzedEvidences: investigation.analyzedEvidenceIds.length,
          minimumForAccusation: MINIMUM_ANALYZED_EVIDENCES_FOR_ACCUSATION,
        },
      );
    }
    if (!mission.suspects.some((suspect) => suspect.suspectId === input.suspectId)) {
      throw HttpErrors.businessRule(
        'INVALID_SUSPECT',
        'O suspeito informado não pertence a esta missão.',
      );
    }
    if (!investigation.analyzedEvidenceIds.includes(input.evidenceId)) {
      throw HttpErrors.businessRule(
        'EVIDENCE_NOT_ANALYZED',
        'A evidência escolhida precisa ter sido analisada por você.',
      );
    }

    const isCorrectSuspect = input.suspectId === mission.solution.culpritSuspectId;
    const score = calculateScore({
      isCorrectSuspect,
      isDecisiveEvidence: input.evidenceId === mission.solution.decisiveEvidenceId,
      hintsUsed: investigation.usedHintIds.length,
    });
    const finishedAt = new Date();

    const updatedInvestigation = await investigationRepository.updateIfInProgress(
      investigation._id,
      {
        $set: {
          status: isCorrectSuspect ? 'SOLUCIONADO' : 'NAO_SOLUCIONADO',
          accusation: {
            suspectId: input.suspectId,
            evidenceId: input.evidenceId,
            accusedAt: finishedAt,
          },
          score,
          classification: classifyDetective(score),
          finishedAt,
        },
      },
    );
    return toInvestigationResultView(ensureUpdated(updatedInvestigation), mission);
  },

  async getResult(userId: string, investigationId: string): Promise<InvestigationResultView> {
    const investigation = await loadOwnedInvestigation(userId, investigationId);
    if (investigation.status === 'EM_ANDAMENTO') {
      throw HttpErrors.conflict(
        'INVESTIGATION_IN_PROGRESS',
        'O resultado só fica disponível depois que a investigação é finalizada.',
      );
    }
    const mission = await loadMissionWithSolution(investigation.missionId);
    return toInvestigationResultView(investigation, mission);
  },
};
