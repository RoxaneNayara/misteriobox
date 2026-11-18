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

  async insertMany(missions: Mission[]): Promise<void> {
    await MissionModel.insertMany(missions);
  },

  async count(): Promise<number> {
    return MissionModel.countDocuments();
  },
};
