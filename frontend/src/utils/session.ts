import type { StoredSession } from './token-storage';

/** Intervalo mínimo entre renovações do token enquanto o jogador está ativo. */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * A sessão local deixa de valer quando o token expirou (inatividade sem
 * renovação ou limite absoluto de 8 h) ou quando o jogador ficou mais tempo que
 * o permitido sem interagir com a página.
 * Sessões antigas, sem os metadados de expiração, são tratadas como expiradas.
 */
export function isSessionExpired(session: StoredSession, now: number): boolean {
  if (session.tokenExpiresAt === null || session.lastActivityAt === null) return true;
  if (now >= session.tokenExpiresAt) return true;
  return now - session.lastActivityAt >= session.idleTimeoutMs;
}

/** Renova somente se houve atividade e a última renovação já tem 5 minutos. */
export function shouldRefreshSession(lastRefreshAt: number, now: number): boolean {
  return now - lastRefreshAt >= REFRESH_INTERVAL_MS;
}
