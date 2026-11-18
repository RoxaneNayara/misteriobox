import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { setUnauthorizedHandler } from '../api/client';
import type { AuthSession, User } from '../types/api';
import { tokenStorage } from '../utils/token-storage';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(tokenStorage.get() ? 'loading' : 'anonymous');
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const startSession = useCallback((session: AuthSession) => {
    tokenStorage.set(session.token);
    setUser(session.user);
    setStatus('authenticated');
    setSessionExpired(false);
  }, []);

  // Restaura a sessão salva ao abrir o site.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => clearSession());
  }, [clearSession]);

  // Qualquer 401 em rotas protegidas encerra a sessão local.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSessionExpired(true);
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) =>
      startSession(await authApi.register(name, email, password)),
    [startSession],
  );

  /** Logout não altera investigações: o progresso continua salvo na API (RN06). */
  const logout = useCallback(() => {
    setSessionExpired(false);
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, sessionExpired, login, register, logout }),
    [user, status, sessionExpired, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
