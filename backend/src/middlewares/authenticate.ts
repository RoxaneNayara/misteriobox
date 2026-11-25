import type { NextFunction, Request, Response } from 'express';
import { HttpErrors } from '../errors/app-error';
import { userRepository } from '../repositories/user.repository';
import { tokenService, type VerifiedSession } from '../services/token.service';

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw HttpErrors.unauthorized('UNAUTHORIZED', 'Cabeçalho Authorization inválido.');
  }
  return token;
}

async function resolveSession(token: string): Promise<VerifiedSession> {
  const session = tokenService.verify(token);
  const user = await userRepository.findById(session.userId);
  if (!user) {
    throw HttpErrors.unauthorized('UNAUTHORIZED', 'Usuário da sessão não encontrado.');
  }
  return session;
}

function attachSession(request: Request, session: VerifiedSession): void {
  request.authenticatedUserId = session.userId;
  request.sessionAuthTime = session.authTime;
}

/** Exige um token válido (RN01). */
export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(request);
  if (!token) {
    throw HttpErrors.unauthorized();
  }
  attachSession(request, await resolveSession(token));
  next();
}

/** Identifica o jogador se houver token; segue anônimo caso contrário. */
export async function optionalAuthenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(request);
  if (token) {
    attachSession(request, await resolveSession(token));
  }
  next();
}

/** Obtém o id do jogador autenticado dentro de um controller protegido. */
export function requireUserId(request: Request): string {
  if (!request.authenticatedUserId) {
    throw HttpErrors.unauthorized();
  }
  return request.authenticatedUserId;
}

/** Momento do login da sessão atual, dentro de um controller protegido. */
export function requireSessionAuthTime(request: Request): number {
  if (request.sessionAuthTime === undefined) {
    throw HttpErrors.unauthorized();
  }
  return request.sessionAuthTime;
}
