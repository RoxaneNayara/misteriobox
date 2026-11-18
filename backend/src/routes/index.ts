import { Router } from 'express';
import { sendSuccess } from '../utils/http-response';
import { authRoutes } from './auth.routes';
import { investigationRoutes } from './investigation.routes';
import { missionRoutes } from './mission.routes';

export const apiRoutes = Router();

apiRoutes.get('/health', (_request, response) => {
  sendSuccess(response, { status: 'ok' });
});
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/missions', missionRoutes);
apiRoutes.use('/investigations', investigationRoutes);
