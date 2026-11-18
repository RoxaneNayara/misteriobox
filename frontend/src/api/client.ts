import { tokenStorage } from '../utils/token-storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Erro padronizado retornado pela API (ou de rede, com status 0). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  /** Quando falso, um 401 não encerra a sessão (ex.: tentativa de login). */
  handleUnauthorized?: boolean;
}

let onUnauthorized: (() => void) | null = null;

/** Registra a ação executada quando a API recusa o token (sessão expirada). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, handleUnauthorized = true } = options;
  const token = tokenStorage.get();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Não foi possível conectar à API. Verifique se o backend está em execução.',
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = (payload ?? {}) as ErrorBody;
    if (response.status === 401 && handleUnauthorized && onUnauthorized) {
      onUnauthorized();
    }
    throw new ApiError(
      response.status,
      errorBody.error?.code ?? 'UNKNOWN_ERROR',
      errorBody.error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.',
      errorBody.error?.details,
    );
  }
  return (payload as { data: T }).data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
