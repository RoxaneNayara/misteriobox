import type { NextFunction, Request, Response } from 'express';
import { HttpErrors } from '../errors/app-error';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

/** Há corpo na requisição (tamanho declarado maior que zero ou envio em partes). */
function hasRequestBody(request: Request): boolean {
  const contentLength = Number(request.headers['content-length'] ?? 0);
  return contentLength > 0 || request.headers['transfer-encoding'] !== undefined;
}

/**
 * B06 — Contrato de entrada da API: toda requisição que envia corpo deve declarar
 * `Content-Type: application/json` (com ou sem `charset`). Outros tipos de mídia
 * recebem 415 antes de qualquer leitura do corpo ou acesso ao banco.
 * Avalia apenas o cabeçalho Content-Type da REQUISIÇÃO; as respostas continuam JSON.
 * Requisições sem corpo (ex.: POST de dica ou abandono) não são afetadas.
 */
export function requireJsonContentType(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  if (!METHODS_WITH_BODY.has(request.method) || !hasRequestBody(request)) {
    next();
    return;
  }
  if (request.is('application/json')) {
    next();
    return;
  }
  throw HttpErrors.unsupportedMediaType(request.headers['content-type'] ?? null);
}
