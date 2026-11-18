import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpErrors } from '../errors/app-error';

interface AccessTokenPayload {
  sub: string;
}

export const tokenService = {
  sign(userId: string): string {
    return jwt.sign({}, env.jwtSecret, {
      subject: userId,
      expiresIn: env.jwtExpiresInSeconds,
      algorithm: 'HS256',
    });
  },

  /** Retorna o id do usuário contido no token ou lança 401. */
  verify(token: string): string {
    try {
      const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
      if (typeof payload === 'string' || typeof payload.sub !== 'string') {
        throw new Error('Token sem identificação do usuário.');
      }
      return (payload as AccessTokenPayload).sub;
    } catch {
      throw HttpErrors.unauthorized('UNAUTHORIZED', 'Token de acesso inválido ou expirado.');
    }
  },

  expiresInSeconds(): number {
    return env.jwtExpiresInSeconds;
  },
};
