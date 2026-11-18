import { isValidObjectId, Types, type UpdateQuery } from 'mongoose';
import {
  InvestigationModel,
  type Investigation,
  type InvestigationRecord,
} from '../models/investigation.model';

export interface CreateInvestigationData {
  userId: string;
  missionId: string;
  unlockedEvidenceIds: string[];
}

export const investigationRepository = {
  async create(data: CreateInvestigationData): Promise<InvestigationRecord> {
    const createdInvestigation = await InvestigationModel.create({
      userId: new Types.ObjectId(data.userId),
      missionId: data.missionId,
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

  async findByUserId(userId: string): Promise<InvestigationRecord[]> {
    return InvestigationModel.find({ userId: new Types.ObjectId(userId) }).lean<
      InvestigationRecord[]
    >();
  },

  async findByUserAndMission(
    userId: string,
    missionId: string,
  ): Promise<InvestigationRecord | null> {
    return InvestigationModel.findOne({
      userId: new Types.ObjectId(userId),
      missionId,
    }).lean<InvestigationRecord>();
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
