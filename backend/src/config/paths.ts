import { existsSync } from 'node:fs';
import path from 'node:path';

/** Raiz do repositório (funciona tanto em `src/` via tsx quanto em `dist/` após o build). */
const repositoryRoot = path.resolve(__dirname, '..', '..', '..');

/**
 * Locais possíveis do documento OpenAPI. Na Vercel, a função é empacotada e o arquivo
 * incluído via `includeFiles` fica relativo ao diretório de trabalho da função.
 */
const OPENAPI_CANDIDATES = [
  path.join(repositoryRoot, 'docs', 'openapi.yaml'),
  path.join(process.cwd(), 'docs', 'openapi.yaml'),
  path.join(process.cwd(), '..', 'docs', 'openapi.yaml'),
];

export const OPENAPI_DOCUMENT_PATH =
  OPENAPI_CANDIDATES.find((candidate) => existsSync(candidate)) ?? OPENAPI_CANDIDATES[0];
