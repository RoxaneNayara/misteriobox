import path from 'node:path';

/** Raiz do repositório (funciona tanto em `src/` via tsx quanto em `dist/` após o build). */
const repositoryRoot = path.resolve(__dirname, '..', '..', '..');

export const OPENAPI_DOCUMENT_PATH = path.join(repositoryRoot, 'docs', 'openapi.yaml');
