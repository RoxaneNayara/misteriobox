/**
 * Persistência local da sessão (B04). Além do token, guarda:
 * - quando o token expira, no relógio deste navegador (evita depender do relógio do servidor);
 * - o momento da última atividade do jogador;
 * - o tempo de inatividade permitido, informado pela API no login.
 * Os valores ficam no localStorage para que uma aba reaberta pelo histórico
 * consiga verificar a expiração antes de exibir qualquer dado protegido.
 */
export const TOKEN_STORAGE_KEY = 'misteriobox.token';
const TOKEN_EXPIRES_AT_KEY = 'misteriobox.tokenExpiresAt';
const LAST_ACTIVITY_KEY = 'misteriobox.lastActivityAt';
const IDLE_TIMEOUT_KEY = 'misteriobox.idleTimeoutMs';

export const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function readNumber(key: string): number | null {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export interface StoredSession {
  token: string;
  tokenExpiresAt: number | null;
  lastActivityAt: number | null;
  idleTimeoutMs: number;
}

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /** Grava um token novo (login ou renovação) e a sua expiração local. */
  save(token: string, expiresInSeconds: number, idleTimeoutSeconds: number, now: number): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(now + expiresInSeconds * 1000));
    localStorage.setItem(IDLE_TIMEOUT_KEY, String(idleTimeoutSeconds * 1000));
  },

  markActivity(now: number): void {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  },

  read(): StoredSession | null {
    const token = this.get();
    if (!token) return null;
    return {
      token,
      tokenExpiresAt: readNumber(TOKEN_EXPIRES_AT_KEY),
      lastActivityAt: readNumber(LAST_ACTIVITY_KEY),
      idleTimeoutMs: readNumber(IDLE_TIMEOUT_KEY) ?? DEFAULT_IDLE_TIMEOUT_MS,
    };
  },

  clear(): void {
    for (const key of [
      TOKEN_STORAGE_KEY,
      TOKEN_EXPIRES_AT_KEY,
      LAST_ACTIVITY_KEY,
      IDLE_TIMEOUT_KEY,
    ]) {
      localStorage.removeItem(key);
    }
  },
};
