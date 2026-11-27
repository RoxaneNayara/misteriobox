import { readFileSync } from 'node:fs';
import { Router } from 'express';
import swaggerUi, { type JsonObject } from 'swagger-ui-express';
import { parse } from 'yaml';
import { OPENAPI_DOCUMENT_PATH } from '../config/paths';

/**
 * A documentação é opcional para o funcionamento da API: se o arquivo não estiver
 * disponível no pacote publicado, só /api-docs fica indisponível (o resto da API segue).
 */
function loadOpenApiDocument(): JsonObject | null {
  try {
    return parse(readFileSync(OPENAPI_DOCUMENT_PATH, 'utf8')) as JsonObject;
  } catch {
    console.warn('[docs] Documento OpenAPI não encontrado; /api-docs ficará indisponível.');
    return null;
  }
}

const openApiDocument = loadOpenApiDocument();

export const docsRoutes = Router();

if (openApiDocument) {
  docsRoutes.get('/openapi.json', (_request, response) => {
    response.json(openApiDocument);
  });
  docsRoutes.use(
    '/',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, { customSiteTitle: 'MistérioBox API — Documentação' }),
  );
} else {
  docsRoutes.use((_request, response) => {
    response.status(503).json({
      error: { code: 'DOCS_UNAVAILABLE', message: 'Documentação da API indisponível.' },
    });
  });
}
