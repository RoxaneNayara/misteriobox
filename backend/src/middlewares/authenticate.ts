import type { NextFunction, Request, Response } from 'express';
import { HttpErrors } from '../errors/app-error';
import { userRepository } from '../repositories/user.repository';
import { tokenService } from '../services/token.service';

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

async function resolveUserId(token: string): Promise<string> {
  const userId = tokenService.verify(token);
  const user = await userRepository.findById(userId);
  if (!user) {
    throw HttpErrors.unauthorized('UNAUTHORIZED', 'Usuário da sessão não encontrado.');
  }
  return userId;
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
  request.authenticatedUserId = await resolveUserId(token);
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
    request.authenticatedUserId = await resolveUserId(token);
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
