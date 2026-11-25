import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpErrors } from '../errors/app-error';

/**
 * Sessão sem estado no servidor (B04):
 * - `auth_time`: momento do login; nunca muda nas renovações;
 * - `exp`: o menor entre "agora + inatividade (30 min)" e "auth_time + 8 h".
 * Cada renovação (`POST /auth/refresh`) emite um novo token com a mesma `auth_time`,
 * deslizando a janela de inatividade sem ultrapassar a expiração absoluta.
 */
interface AccessTokenPayload {
  sub: string;
  auth_time: number;
  exp: number;
}

export interface VerifiedSession {
  userId: string;
  authTime: number;
}

export interface IssuedToken {
  token: string;
  expiresIn: number;
  sessionExpiresAt: Date;
}

const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

function isAccessTokenPayload(payload: unknown): payload is AccessTokenPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.sub === 'string' &&
    typeof candidate.auth_time === 'number' &&
    typeof candidate.exp === 'number'
  );
}

export const tokenService = {
  /** Emite um token; `authTime` vem do login original (renovações) ou é agora (login). */
  issue(userId: string, authTime: number = nowInSeconds()): IssuedToken {
    const now = nowInSeconds();
    const absoluteExpiry = authTime + env.jwtExpiresInSeconds;
    if (absoluteExpiry <= now) {
      throw HttpErrors.unauthorized(
        'SESSION_EXPIRED',
        'Sua sessão atingiu o tempo máximo. Entre novamente.',
      );
    }
    const exp = Math.min(now + env.sessionIdleTimeoutSeconds, absoluteExpiry);
    const token = jwt.sign({ auth_time: authTime, exp }, env.jwtSecret, {
      subject: userId,
      algorithm: 'HS256',
    });
    return { token, expiresIn: exp - now, sessionExpiresAt: new Date(absoluteExpiry * 1000) };
  },

  /** Valida assinatura e expiração; lança 401 (`SESSION_EXPIRED` quando expirou). */
  verify(token: string): VerifiedSession {
    let payload: unknown;
    try {
      payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw HttpErrors.unauthorized(
          'SESSION_EXPIRED',
          'Sua sessão expirou por inatividade. Entre novamente.',
        );
      }
      throw HttpErrors.unauthorized('UNAUTHORIZED', 'Token de acesso inválido ou expirado.');
    }
    if (!isAccessTokenPayload(payload)) {
      throw HttpErrors.unauthorized('UNAUTHORIZED', 'Token de acesso inválido ou expirado.');
    }
    return { userId: payload.sub, authTime: payload.auth_time };
  },

  idleTimeoutSeconds(): number {
    return env.sessionIdleTimeoutSeconds;
  },
};
