import { useEffect, useRef } from 'react';
import { isSessionExpired, shouldRefreshSession } from '../utils/session';
import { TOKEN_STORAGE_KEY, tokenStorage } from '../utils/token-storage';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
const ACTIVITY_THROTTLE_MS = 5_000;
const CHECK_INTERVAL_MS = 15_000;

interface SessionMonitorOptions {
  enabled: boolean;
  onExpired: () => void;
  onSignedOutElsewhere: () => void;
  refresh: () => Promise<void>;
}

/**
 * B04 — Monitora a sessão enquanto o jogador está autenticado:
 * - registra atividade real (clique, tecla, rolagem, toque) e renova o token
 *   no máximo a cada 5 minutos enquanto houver atividade;
 * - verifica a expiração periodicamente e sempre que a aba volta a ficar visível,
 *   a janela recebe foco ou a página é restaurada pelo histórico (bfcache);
 * - encerra a sessão nesta aba quando o logout acontece em outra aba.
 */
export function useSessionMonitor({
  enabled,
  onExpired,
  onSignedOutElsewhere,
  refresh,
}: SessionMonitorOptions): void {
  const callbacks = useRef({ onExpired, onSignedOutElsewhere, refresh });
  callbacks.current = { onExpired, onSignedOutElsewhere, refresh };

  useEffect(() => {
    if (!enabled) return;

    let lastActivityWrite = 0;
    let lastRefreshAt = Date.now();
    let refreshing = false;

    /** Retorna `true` quando a sessão continua válida. */
    const checkSession = (): boolean => {
      const stored = tokenStorage.read();
      if (!stored) {
        callbacks.current.onSignedOutElsewhere();
        return false;
      }
      if (isSessionExpired(stored, Date.now())) {
        callbacks.current.onExpired();
        return false;
      }
      return true;
    };

    const handleActivity = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastActivityWrite < ACTIVITY_THROTTLE_MS) return;
      // A atividade só conta se a sessão ainda estava válida antes dela.
      if (!checkSession()) return;
      lastActivityWrite = now;
      tokenStorage.markActivity(now);
      if (!refreshing && shouldRefreshSession(lastRefreshAt, now)) {
        refreshing = true;
        lastRefreshAt = now;
        void callbacks.current.refresh().finally(() => {
          refreshing = false;
        });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSession();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY && event.newValue === null) {
        callbacks.current.onSignedOutElsewhere();
      }
    };

    checkSession();
    const interval = window.setInterval(checkSession, CHECK_INTERVAL_MS);
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true, capture: true });
    }
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkSession);
    window.addEventListener('pageshow', checkSession);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(interval);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity, { capture: true });
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkSession);
      window.removeEventListener('pageshow', checkSession);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enabled]);
}
