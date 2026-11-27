import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodType } from 'zod';
import { HttpErrors } from '../errors/app-error';

function toValidationDetails(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join('.') || '(corpo)',
    message: issue.code === 'unrecognized_keys' ? 'Campo não permitido.' : issue.message,
  }));
}

/** Valida e normaliza o corpo da requisição. */
export function validateBody(schema: ZodType) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.body ?? {});
    if (!result.success) {
      throw HttpErrors.badRequest(
        'VALIDATION_ERROR',
        'Dados da requisição inválidos.',
        toValidationDetails(result.error),
      );
    }
    request.body = result.data;
    next();
  };
}

/** Valida os parâmetros de rota. */
export function validateParams(schema: ZodType) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw HttpErrors.badRequest(
        'VALIDATION_ERROR',
        'Parâmetros da requisição inválidos.',
        toValidationDetails(result.error),
      );
    }
    next();
  };
}
