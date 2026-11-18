import type { Request, Response } from 'express';
import { missionService } from '../services/mission.service';
import { sendSuccess } from '../utils/http-response';

export const missionController = {
  async list(request: Request, response: Response): Promise<void> {
    const catalog = await missionService.listCatalog(request.authenticatedUserId);
    sendSuccess(response, catalog);
  },

  async getById(request: Request<{ missionId: string }>, response: Response): Promise<void> {
    const mission = await missionService.getPublicDetails(request.params.missionId);
    sendSuccess(response, mission);
  },
};
