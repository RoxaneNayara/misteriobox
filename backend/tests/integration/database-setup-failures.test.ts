import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { describeDatabaseError } from '../../src/errors/database-errors';

/**
 * Reproduz, com autenticação ativada, as falhas mais prováveis do primeiro deploy no Atlas:
 * senha recusada (etapa de conexão) e usuário com readWrite em outro banco (etapa de índices).
 * Usuário e senha abaixo são fictícios e existem só no MongoDB temporário do teste.
 */
const APP_USER = 'misteriobox-teste';
const APP_PASSWORD = 'SenhaFicticia123';
const AUTHORIZED_DB = 'misteriobox';

let server: MongoMemoryServer;

function uriFor(user: string, password: string): string {
  const { hostname, port } = new URL(server.getUri());
  return `mongodb://${user}:${password}@${hostname}:${port}/?authSource=admin`;
}

async function failureOf(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    return describeDatabaseError(error);
  }
  throw new Error('a preparação deveria ter falhado');
}

beforeAll(async () => {
  server = await MongoMemoryServer.create({
    auth: {
      enable: true,
      extraUsers: [
        {
          createUser: APP_USER,
          pwd: APP_PASSWORD,
          database: 'admin',
          roles: [{ role: 'readWrite', db: AUTHORIZED_DB }],
        },
      ],
    },
  });
}, 60_000);

afterEach(async () => {
  await disconnectDatabase();
});

afterAll(async () => {
  await server.stop();
});

describe('Falhas na preparação do banco persistente', () => {
  it('senha incorreta: falha na conexão, categoria autenticação', async () => {
    const diagnostic = await failureOf(() =>
      connectDatabase({ uri: uriFor(APP_USER, 'SenhaErrada000'), dbName: AUTHORIZED_DB }),
    );
    expect(diagnostic).toMatchObject({
      phase: 'conexao',
      name: 'MongoServerError',
      code: 18,
      category: 'autenticacao',
    });
  });

  it('banco diferente do autorizado: falha nos índices, categoria permissão', async () => {
    const diagnostic = await failureOf(() =>
      connectDatabase({ uri: uriFor(APP_USER, APP_PASSWORD), dbName: 'misteriobox-prod' }),
    );
    expect(diagnostic).toMatchObject({
      phase: 'indices',
      name: 'MongoServerError',
      code: 13,
      codeName: 'Unauthorized',
      category: 'permissao',
    });
    // A conexão é desfeita para que a próxima tentativa recomece do zero.
    expect(mongoose.connection.readyState).toBe(0);
  });

  it('readWrite no banco correto basta para criar índices e carregar o catálogo', async () => {
    await expect(
      connectDatabase({ uri: uriFor(APP_USER, APP_PASSWORD), dbName: AUTHORIZED_DB }),
    ).resolves.toBe('persistent');
    const { seedDatabase } = await import('../../src/database/seed');
    await seedDatabase({ demoUsers: false });
    expect(await mongoose.connection.collection('missions').countDocuments()).toBe(10);
  });
});
