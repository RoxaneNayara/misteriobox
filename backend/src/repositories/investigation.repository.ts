import { isValidObjectId, Types, type UpdateQuery } from 'mongoose';
import {
  InvestigationModel,
  type Investigation,
  type InvestigationRecord,
} from '../models/investigation.model';

export interface CreateInvestigationData {
  userId: string;
  missionId: string;
  attemptNumber: number;
  unlockedEvidenceIds: string[];
}

export const investigationRepository = {
  async create(data: CreateInvestigationData): Promise<InvestigationRecord> {
    const createdInvestigation = await InvestigationModel.create({
      userId: new Types.ObjectId(data.userId),
      missionId: data.missionId,
      attemptNumber: data.attemptNumber,
      unlockedEvidenceIds: data.unlockedEvidenceIds,
    });
    return createdInvestigation.toObject();
  },

  async findById(investigationId: string): Promise<InvestigationRecord | null> {
    if (!isValidObjectId(investigationId)) {
      return null;
    }
    return InvestigationModel.findById(investigationId).lean<InvestigationRecord>();
  },

  /** Histórico do jogador: da tentativa mais recente para a mais antiga. */
  async findByUserId(userId: string): Promise<InvestigationRecord[]> {
    return InvestigationModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1, _id: -1 })
      .lean<InvestigationRecord[]>();
  },

  async findActiveByUserAndMission(
    userId: string,
    missionId: string,
  ): Promise<InvestigationRecord | null> {
    return InvestigationModel.findOne({
      userId: new Types.ObjectId(userId),
      missionId,
      status: 'EM_ANDAMENTO',
    }).lean<InvestigationRecord>();
  },

  /** Maior número de tentativa já usado pelo jogador na missão (0 se nunca jogou). */
  async findLatestAttemptNumber(userId: string, missionId: string): Promise<number> {
    const latestAttempt = await InvestigationModel.findOne({
      userId: new Types.ObjectId(userId),
      missionId,
    })
      .sort({ attemptNumber: -1 })
      .select('attemptNumber')
      .lean<Pick<InvestigationRecord, 'attemptNumber'>>();
    return latestAttempt?.attemptNumber ?? 0;
  },

  /**
   * Atualiza a investigação somente se ela ainda estiver em andamento.
   * Retorna `null` se o estado tiver mudado entre a leitura e a escrita.
   */
  async updateIfInProgress(
    investigationId: Types.ObjectId,
    update: UpdateQuery<Investigation>,
    extraConditions: Record<string, unknown> = {},
  ): Promise<InvestigationRecord | null> {
    return InvestigationModel.findOneAndUpdate(
      { _id: investigationId, status: 'EM_ANDAMENTO', ...extraConditions },
      update,
      { new: true },
    ).lean<InvestigationRecord>();
  },
};
