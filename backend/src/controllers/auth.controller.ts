import type { Request, Response } from 'express';
import { requireUserId } from '../middlewares/authenticate';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/http-response';

export const authController = {
  async register(request: Request, response: Response): Promise<void> {
    const session = await authService.register(request.body);
    sendSuccess(response, session, 201);
  },

  async login(request: Request, response: Response): Promise<void> {
    const session = await authService.login(request.body);
    sendSuccess(response, session);
  },

  async me(request: Request, response: Response): Promise<void> {
    const user = await authService.getAuthenticatedUser(requireUserId(request));
    sendSuccess(response, user);
  },
};
