import { HttpErrors } from '../errors/app-error';
import {
  toMissionCatalogItemView,
  toMissionDetailsView,
  type MissionCatalogItemView,
  type MissionDetailsView,
} from '../mappers/mission.mapper';
import { investigationRepository } from '../repositories/investigation.repository';
import { missionRepository } from '../repositories/mission.repository';

export const missionService = {
  /**
   * Catálogo de missões. Quando há um jogador autenticado, inclui o status
   * da investigação dele em cada missão (somente as próprias — RN01).
   */
  async listCatalog(userId?: string): Promise<MissionCatalogItemView[]> {
    const missions = await missionRepository.findAll();
    const investigations = userId ? await investigationRepository.findByUserId(userId) : [];
    return missions.map((mission) =>
      toMissionCatalogItemView(
        mission,
        investigations.find((investigation) => investigation.missionId === mission.missionId),
      ),
    );
  },

  async getPublicDetails(missionId: string): Promise<MissionDetailsView> {
    const mission = await missionRepository.findById(missionId);
    if (!mission) {
      throw HttpErrors.notFound('MISSION_NOT_FOUND', 'Missão não encontrada.');
    }
    return toMissionDetailsView(mission);
  },
};
