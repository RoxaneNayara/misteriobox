import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import handler from '../../../api/index';
import { disconnectDatabase } from '../../src/database/connection';

/**
 * Função da Vercel (api/index.ts): prepara o banco na primeira requisição, reaproveita a
 * preparação nas seguintes e entrega as rotas do Express sem alteração.
 */
afterAll(async () => {
  await disconnectDatabase();
});

describe('Função da Vercel', () => {
  it('atende /api/health e o catálogo com 10 missões', async () => {
    const [health, missions] = await Promise.all([
      request(handler).get('/api/health'),
      request(handler).get('/api/missions'),
    ]);
    expect(health.status).toBe(200);
    expect(missions.status).toBe(200);
    expect(missions.body.data).toHaveLength(10);
  });

  it('mantém a proteção das rotas autenticadas e o formato de erro', async () => {
    const response = await request(handler).get('/api/investigations');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBeDefined();
  });

  it('encontra o documento OpenAPI para /api-docs', async () => {
    const response = await request(handler).get('/api-docs/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toMatch(/^3\./);
  });
});
