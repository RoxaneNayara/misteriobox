import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath — destino após o login', () => {
  it.each(['/', '/historico', '/investigacoes/6b09c1d9bb3238d63034d185/resultado'])(
    'aceita caminho interno %s',
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '\\\\example.com',
    '/historico\\..\\',
    'historico',
    '',
  ])('recusa %s e usa o catálogo', (path) => {
    expect(safeRedirectPath(path)).toBe('/');
  });

  it('recusa valores que não são texto', () => {
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath({ pathname: '/historico' })).toBe('/');
  });
});
