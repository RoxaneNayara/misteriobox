import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * Função da Vercel com o banco indisponível: responde 503 e registra só metadados seguros
 * (etapa, tipo e código), nunca a mensagem do driver, a URI, o usuário ou a senha.
 * O cenário reproduz um usuário com readWrite em `misteriobox` e MONGODB_DB_NAME diferente.
 * Usuário e senha são fictícios e existem só no MongoDB temporário do teste.
 */
const APP_USER = 'misteriobox-teste';
const APP_PASSWORD = 'SenhaFicticia123';

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create({
    auth: {
      enable: true,
      extraUsers: [
        {
          createUser: APP_USER,
          pwd: APP_PASSWORD,
          database: 'admin',
          roles: [{ role: 'readWrite', db: 'misteriobox' }],
        },
      ],
    },
  });
  const { hostname, port } = new URL(server.getUri());
  vi.stubEnv(
    'MONGODB_URI',
    `mongodb://${APP_USER}:${APP_PASSWORD}@${hostname}:${port}/?authSource=admin`,
  );
  vi.stubEnv('MONGODB_DB_NAME', 'misteriobox-prod');
}, 60_000);

afterAll(async () => {
  vi.unstubAllEnvs();
  const { disconnectDatabase } = await import('../../src/database/connection');
  await disconnectDatabase();
  await server.stop();
});

describe('Função da Vercel com o banco indisponível', () => {
  it('responde 503 e registra só metadados seguros, tentando de novo a cada requisição', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      // Importado depois de definir as variáveis: o ambiente é lido na carga do módulo.
      const { default: handler } = await import('../../../api/index');
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const response = await request(handler).post('/api/auth/register').send({});
        expect(response.status).toBe(503);
        expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
      }

      const lines = consoleError.mock.calls.map((call) => call.join(' '));
      expect(lines).toHaveLength(2);
      for (const line of lines) {
        expect(line).toBe(
          '[api] Banco de dados indisponível: {"phase":"indices","name":"MongoServerError","code":13,"codeName":"Unauthorized","category":"permissao"}',
        );
        expect(line).not.toContain(APP_PASSWORD);
        expect(line).not.toContain(APP_USER);
      }
    } finally {
      consoleError.mockRestore();
    }
  });
});
