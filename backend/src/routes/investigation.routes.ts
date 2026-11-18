import { Router } from 'express';
import { investigationController } from '../controllers/investigation.controller';
import { authenticate } from '../middlewares/authenticate';
import { validateBody, validateParams } from '../middlewares/validate';
import {
  accusationSchema,
  evidenceParamsSchema,
  investigationIdParamsSchema,
  startInvestigationSchema,
} from '../validators/investigation.validator';

export const investigationRoutes = Router();

// RN01: todas as rotas de investigação exigem autenticação.
investigationRoutes.use(authenticate);

const withInvestigationId = validateParams(investigationIdParamsSchema);

// Histórico do próprio jogador: o usuário vem do token, nunca de parâmetro.
investigationRoutes.get('/', investigationController.listHistory);
investigationRoutes.post(
  '/',
  validateBody(startInvestigationSchema),
  investigationController.start,
);
investigationRoutes.get(
  '/:investigationId',
  withInvestigationId,
  investigationController.getProgress,
);
investigationRoutes.post(
  '/:investigationId/evidences/:evidenceId/analysis',
  validateParams(evidenceParamsSchema),
  investigationController.analyzeEvidence,
);
investigationRoutes.post(
  '/:investigationId/hints',
  withInvestigationId,
  investigationController.useHint,
);
investigationRoutes.post(
  '/:investigationId/abandon',
  withInvestigationId,
  investigationController.abandon,
);
investigationRoutes.post(
  '/:investigationId/accusation',
  withInvestigationId,
  validateBody(accusationSchema),
  investigationController.accuse,
);
investigationRoutes.get(
  '/:investigationId/result',
  withInvestigationId,
  investigationController.getResult,
);
