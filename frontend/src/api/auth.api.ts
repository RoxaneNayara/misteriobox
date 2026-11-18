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

  me(): Promise<User> {
    return apiRequest('/auth/me', { handleUnauthorized: false });
  },
};
