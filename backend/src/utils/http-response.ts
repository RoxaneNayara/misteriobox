import type { Response } from 'express';
import type { AppError } from '../errors/app-error';

/** Respostas de sucesso: `{ "data": ... }`. */
export function sendSuccess<T>(response: Response, data: T, statusCode = 200): void {
  response.status(statusCode).json({ data });
}

/** Respostas de erro: `{ "error": { "code", "message", "details"? } }`. */
export function sendError(response: Response, error: AppError): void {
  response.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  });
}
