import { MissionModel, type Mission, type PublicMission } from '../models/mission.model';

export const missionRepository = {
  /** Lista as missões sem os dados secretos da solução. */
  async findAll(): Promise<PublicMission[]> {
    return MissionModel.find().sort({ order: 1 }).lean<PublicMission[]>();
  },

  /** Busca a missão sem os dados secretos da solução. */
  async findById(missionId: string): Promise<PublicMission | null> {
    return MissionModel.findOne({ missionId }).lean<PublicMission>();
  },

  /** Uso restrito à resolução e ao relatório final. */
  async findByIdWithSolution(missionId: string): Promise<Mission | null> {
    return MissionModel.findOne({ missionId }).select('+solution').lean<Mission>();
  },

  /**
   * Carga idempotente do catálogo: insere as missões que faltam e atualiza o conteúdo das
   * existentes (mesmo `missionId`, mesmo `_id`). Nunca remove missões nem toca nas
   * investigações, que referenciam a missão pelo `missionId`.
   */
  async upsertMany(missions: Mission[]): Promise<{ inserted: number; updated: number }> {
    const result = await MissionModel.bulkWrite(
      missions.map((mission) => ({
        updateOne: {
          filter: { missionId: mission.missionId },
          update: { $set: mission },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    return { inserted: result.upsertedCount, updated: result.modifiedCount };
  },

  async count(): Promise<number> {
    return MissionModel.countDocuments();
  },
};
