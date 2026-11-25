import { describe, expect, it } from 'vitest';
import { REFRESH_INTERVAL_MS, isSessionExpired, shouldRefreshSession } from './session';
import type { StoredSession } from './token-storage';

const MINUTE = 60 * 1000;
const NOW = Date.UTC(2026, 10, 25, 12, 0, 0);

function session(overrides: Partial<StoredSession> = {}): StoredSession {
  return {
    token: 'token',
    tokenExpiresAt: NOW + 20 * MINUTE,
    lastActivityAt: NOW - 5 * MINUTE,
    idleTimeoutMs: 30 * MINUTE,
    ...overrides,
  };
}

describe('isSessionExpired — B04', () => {
  it('mantém a sessão com atividade recente e token dentro do prazo', () => {
    expect(isSessionExpired(session(), NOW)).toBe(false);
  });

  it('expira após 30 min sem atividade, mesmo com token ainda válido', () => {
    expect(isSessionExpired(session({ lastActivityAt: NOW - 29 * MINUTE }), NOW)).toBe(false);
    expect(isSessionExpired(session({ lastActivityAt: NOW - 30 * MINUTE }), NOW)).toBe(true);
  });

  it('expira quando o token expirou (inatividade sem renovação ou limite de 8 h)', () => {
    expect(isSessionExpired(session({ tokenExpiresAt: NOW }), NOW)).toBe(true);
  });

  it('respeita o tempo de inatividade informado pela API', () => {
    const shortIdle = session({ idleTimeoutMs: 10 * MINUTE, lastActivityAt: NOW - 11 * MINUTE });
    expect(isSessionExpired(shortIdle, NOW)).toBe(true);
  });

  it('trata como expirada a sessão antiga sem metadados de expiração', () => {
    expect(isSessionExpired(session({ tokenExpiresAt: null }), NOW)).toBe(true);
    expect(isSessionExpired(session({ lastActivityAt: null }), NOW)).toBe(true);
  });
});

describe('shouldRefreshSession', () => {
  it('renova no máximo a cada 5 minutos', () => {
    expect(shouldRefreshSession(NOW - REFRESH_INTERVAL_MS + 1, NOW)).toBe(false);
    expect(shouldRefreshSession(NOW - REFRESH_INTERVAL_MS, NOW)).toBe(true);
  });
});
