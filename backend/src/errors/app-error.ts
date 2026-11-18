export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'ROUTE_NOT_FOUND'
  | 'MISSION_NOT_FOUND'
  | 'INVESTIGATION_NOT_FOUND'
  | 'EVIDENCE_NOT_FOUND'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVESTIGATION_ALREADY_EXISTS'
  | 'INVESTIGATION_FINISHED'
  | 'INVESTIGATION_IN_PROGRESS'
  | 'EVIDENCE_ALREADY_ANALYZED'
  | 'NO_HINTS_REMAINING'
  | 'CONCURRENT_UPDATE'
  | 'EVIDENCE_LOCKED'
  | 'INSUFFICIENT_EVIDENCES'
  | 'INVALID_SUSPECT'
  | 'EVIDENCE_NOT_ANALYZED'
  | 'INTERNAL_ERROR';

/** Erro de aplicação com status HTTP e código estável para o cliente. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const HttpErrors = {
  badRequest: (code: ErrorCode, message: string, details?: unknown) =>
    new AppError(400, code, message, details),
  unauthorized: (code: ErrorCode = 'UNAUTHORIZED', message = 'Autenticação necessária.') =>
    new AppError(401, code, message),
  forbidden: (message = 'Você não tem permissão para acessar este recurso.') =>
    new AppError(403, 'FORBIDDEN', message),
  notFound: (code: ErrorCode, message: string) => new AppError(404, code, message),
  conflict: (code: ErrorCode, message: string, details?: unknown) =>
    new AppError(409, code, message, details),
  businessRule: (code: ErrorCode, message: string, details?: unknown) =>
    new AppError(422, code, message, details),
};
