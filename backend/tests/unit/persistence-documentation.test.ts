import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Documentação de persistência: Production e Preview usam MongoDB Atlas (persistente); só o
 * ambiente local sem MONGODB_URI e os testes usam o banco em memória. Impede que voltem
 * afirmações de que os dados duram apenas enquanto o servidor está em execução.
 */
const root = resolve(__dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const UNQUALIFIED_CLAIMS = [
  /enquanto o (servidor|backend)[^.]*em execução/i,
  /não são persistência permanente/i,
  /permanecerem no banco em memória/i,
];

describe('Documentação de persistência', () => {
  it.each([
    'README.md',
    'docs/openapi.yaml',
    'docs/implantacao.md',
    'frontend/src/pages/HistoryPage.tsx',
  ])('%s não afirma que os dados são apenas temporários', (path) => {
    const content = read(path);
    for (const claim of UNQUALIFIED_CLAIMS) expect(content).not.toMatch(claim);
  });

  it('README diferencia Atlas persistente (Production/Preview) do banco em memória local', () => {
    const readme = read('README.md');
    expect(readme).toMatch(
      /Production e Preview \(Vercel\)\s*\|\s*MongoDB Atlas[^|]*\|\s*Persistentes/,
    );
    expect(readme).toMatch(
      /Local sem `MONGODB_URI` \(padrão\), testes e CI\s*\|\s*MongoDB em memória\s*\|\s*Temporários/,
    );
  });
});
