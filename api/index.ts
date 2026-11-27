import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../backend/src/app';
import { ensureDatabaseReady } from '../backend/src/database/ready';

/**
 * Função da Vercel que atende /api/* e /api-docs/* (ver vercel.json).
 * O app Express é criado uma vez por instância; a conexão com o MongoDB persistente e a
 * carga idempotente do catálogo são feitas na primeira requisição e reaproveitadas.
 */
const app = createApp();

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  try {
    await ensureDatabaseReady();
  } catch (error) {
    // Registra só o tipo e a mensagem; a URI do banco nunca é exibida.
    console.error(
      '[api] Banco de dados indisponível:',
      error instanceof Error ? error.name : error,
    );
    response.statusCode = 503;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(
      JSON.stringify({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
        },
      }),
    );
    return;
  }
  app(request, response);
}
