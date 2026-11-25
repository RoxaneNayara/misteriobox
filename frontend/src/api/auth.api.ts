import type { AuthSession, User } from '../types/api';
import { apiRequest } from './client';

export const authApi = {
  register(name: string, email: string, password: string): Promise<AuthSession> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
      handleUnauthorized: false,
    });
  },

  login(email: string, password: string): Promise<AuthSession> {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      handleUnauthorized: false,
    });
  },

  /** Renova a janela de inatividade da sessão (B04). */
  refresh(): Promise<AuthSession> {
    return apiRequest('/auth/refresh', { method: 'POST' });
  },

  me(): Promise<User> {
    return apiRequest('/auth/me', { handleUnauthorized: false });
  },
};
