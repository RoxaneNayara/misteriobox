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
   * Catálogo de missões. Quando há um jogador autenticado, cada missão traz a
   * tentativa ativa dele (ou, se não houver, a mais recente) e o total de
   * tentativas — somente as próprias (RN01).
   */
  async listCatalog(userId?: string): Promise<MissionCatalogItemView[]> {
    const missions = await missionRepository.findAll();
    // Já ordenadas da mais recente para a mais antiga.
    const investigations = userId ? await investigationRepository.findByUserId(userId) : [];
    return missions.map((mission) => {
      const attempts = investigations.filter(
        (investigation) => investigation.missionId === mission.missionId,
      );
      const featuredAttempt =
        attempts.find((investigation) => investigation.status === 'EM_ANDAMENTO') ?? attempts[0];
      return toMissionCatalogItemView(mission, featuredAttempt, attempts.length);
    });
  },

  async getPublicDetails(missionId: string): Promise<MissionDetailsView> {
    const mission = await missionRepository.findById(missionId);
    if (!mission) {
      throw HttpErrors.notFound('MISSION_NOT_FOUND', 'Missão não encontrada.');
    }
    return toMissionDetailsView(mission);
  },
};
