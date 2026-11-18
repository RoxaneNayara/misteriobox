import { readFileSync } from 'node:fs';
import { Router } from 'express';
import swaggerUi, { type JsonObject } from 'swagger-ui-express';
import { parse } from 'yaml';
import { OPENAPI_DOCUMENT_PATH } from '../config/paths';

const openApiDocument = parse(readFileSync(OPENAPI_DOCUMENT_PATH, 'utf8')) as JsonObject;

export const docsRoutes = Router();

docsRoutes.get('/openapi.json', (_request, response) => {
  response.json(openApiDocument);
});
docsRoutes.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customSiteTitle: 'MistérioBox API — Documentação' }),
);
