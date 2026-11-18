import type { NextFunction, Request, Response } from 'express';
import { AppError, HttpErrors } from '../errors/app-error';
import { sendError } from '../utils/http-response';

function isJsonSyntaxError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    'type' in error &&
    (error as SyntaxError & { type?: string }).type === 'entity.parse.failed'
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export function notFoundHandler(request: Request, _response: Response, next: NextFunction): void {
  next(
    HttpErrors.notFound('ROUTE_NOT_FOUND', `Rota ${request.method} ${request.path} não existe.`),
  );
}

/** Tratamento centralizado de erros: toda falha vira uma resposta no mesmo formato. */
export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    sendError(response, error);
    return;
  }
  if (isJsonSyntaxError(error)) {
    sendError(
      response,
      HttpErrors.badRequest('INVALID_JSON', 'O corpo da requisição não é um JSON válido.'),
    );
    return;
  }
  if (isDuplicateKeyError(error)) {
    sendError(
      response,
      HttpErrors.conflict('INVESTIGATION_ALREADY_EXISTS', 'O registro já existe.'),
    );
    return;
  }
  console.error('[error]', error);
  sendError(response, new AppError(500, 'INTERNAL_ERROR', 'Erro interno do servidor.'));
}
