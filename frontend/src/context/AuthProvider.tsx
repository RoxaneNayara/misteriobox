import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { ApiError, setUnauthorizedHandler } from '../api/client';
import type { AuthSession, User } from '../types/api';
import { isSessionExpired } from '../utils/session';
import { tokenStorage } from '../utils/token-storage';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { useSessionMonitor } from './useSessionMonitor';

type StoredSessionState = 'none' | 'valid' | 'expired';

/** Estado da sessão guardada, avaliado antes de qualquer dado protegido ser exibido. */
function readStoredSessionState(): StoredSessionState {
  const stored = tokenStorage.read();
  if (!stored) return 'none';
  return isSessionExpired(stored, Date.now()) ? 'expired' : 'valid';
}

function persistSession(session: AuthSession): void {
  const now = Date.now();
  tokenStorage.save(session.token, session.expiresIn, session.idleTimeoutSeconds, now);
  tokenStorage.markActivity(now);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialSession] = useState(readStoredSessionState);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    initialSession === 'valid' ? 'loading' : 'anonymous',
  );
  const [sessionExpired, setSessionExpired] = useState(initialSession === 'expired');
  const [loggedOut, setLoggedOut] = useState(false);

  /** Remove a sessão local. Não afeta investigações: o progresso fica na API (RN06). */
  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const expireSession = useCallback(() => {
    setLoggedOut(false);
    setSessionExpired(true);
    clearSession();
  }, [clearSession]);

  const startSession = useCallback((session: AuthSession) => {
    persistSession(session);
    setUser(session.user);
    setStatus('authenticated');
    setSessionExpired(false);
    setLoggedOut(false);
  }, []);

  // Restaura a sessão salva ao abrir o site — somente se ainda estiver dentro do prazo.
  useEffect(() => {
    if (initialSession === 'expired') {
      tokenStorage.clear();
      return;
    }
    if (initialSession !== 'valid') return;
    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) expireSession();
        else clearSession();
      });
  }, [initialSession, expireSession, clearSession]);

  // Qualquer 401 em rotas protegidas encerra a sessão local.
  useEffect(() => {
    setUnauthorizedHandler(expireSession);
    return () => setUnauthorizedHandler(null);
  }, [expireSession]);

  const refreshSession = useCallback(async () => {
    try {
      persistSession(await authApi.refresh());
    } catch {
      // Um 401 já encerra a sessão pelo handler global; falhas de rede são
      // tentadas de novo na próxima atividade.
    }
  }, []);

  useSessionMonitor({
    enabled: status === 'authenticated',
    onExpired: expireSession,
    onSignedOutElsewhere: clearSession,
    refresh: refreshSession,
  });

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
    setLoggedOut(true);
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, sessionExpired, loggedOut, login, register, logout }),
    [user, status, sessionExpired, loggedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
