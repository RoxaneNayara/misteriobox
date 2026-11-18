import type { Request, Response } from 'express';
import { requireUserId } from '../middlewares/authenticate';
import { investigationService } from '../services/investigation.service';
import { sendSuccess } from '../utils/http-response';

type InvestigationRequest = Request<{ investigationId: string }>;
type EvidenceRequest = Request<{ investigationId: string; evidenceId: string }>;

export const investigationController = {
  async listHistory(request: Request, response: Response): Promise<void> {
    const history = await investigationService.listHistory(requireUserId(request));
    sendSuccess(response, history);
  },

  async start(request: Request, response: Response): Promise<void> {
    const progress = await investigationService.start(
      requireUserId(request),
      request.body.missionId,
    );
    sendSuccess(response, progress, 201);
  },

  async getProgress(request: InvestigationRequest, response: Response): Promise<void> {
    const progress = await investigationService.getProgress(
      requireUserId(request),
      request.params.investigationId,
    );
    sendSuccess(response, progress);
  },

  async analyzeEvidence(request: EvidenceRequest, response: Response): Promise<void> {
    const progress = await investigationService.analyzeEvidence(
      requireUserId(request),
      request.params.investigationId,
      request.params.evidenceId,
    );
    sendSuccess(response, progress);
  },

  async useHint(request: InvestigationRequest, response: Response): Promise<void> {
    const progress = await investigationService.useHint(
      requireUserId(request),
      request.params.investigationId,
    );
    sendSuccess(response, progress);
  },

  async abandon(request: InvestigationRequest, response: Response): Promise<void> {
    const progress = await investigationService.abandon(
      requireUserId(request),
      request.params.investigationId,
    );
    sendSuccess(response, progress);
  },

  async accuse(request: InvestigationRequest, response: Response): Promise<void> {
    const result = await investigationService.accuse(
      requireUserId(request),
      request.params.investigationId,
      request.body,
    );
    sendSuccess(response, result);
  },

  async getResult(request: InvestigationRequest, response: Response): Promise<void> {
    const result = await investigationService.getResult(
      requireUserId(request),
      request.params.investigationId,
    );
    sendSuccess(response, result);
  },
};
