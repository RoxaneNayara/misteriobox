import { Router } from 'express';
import { missionController } from '../controllers/mission.controller';
import { optionalAuthenticate } from '../middlewares/authenticate';

export const missionRoutes = Router();

missionRoutes.get('/', optionalAuthenticate, missionController.list);
missionRoutes.get('/:missionId', missionController.getById);
