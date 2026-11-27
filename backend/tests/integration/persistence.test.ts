import type { Express } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import {
  connectDatabase,
  disconnectDatabase,
  getDatabaseMode,
} from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import { MissionModel } from '../../src/models/mission.model';
import { UserModel } from '../../src/models/user.model';

/**
 * Persistência entre reinicializações. Um MongoDB separado, que continua no ar entre as
 * "reinicializações" da API, faz o papel do banco persistente (como o MongoDB Atlas):
 * a API conecta por URI (modo persistente), desconecta e conecta de novo.
 */
const PASSWORD = 'Detetive2026';
let externalDatabase: MongoMemoryServer;
let uri: string;
let app: Express;

async function startApi(): Promise<void> {
  expect(await connectDatabase({ uri, dbName: 'misteriobox-persistencia' })).toBe('persistent');
  await seedDatabase({ demoUsers: false });
  app = createApp();
}

async function restartApi(): Promise<void> {
  await disconnectDatabase();
  expect(getDatabaseMode()).toBeNull();
  await startApi();
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  externalDatabase = await MongoMemoryServer.create();
  uri = externalDatabase.getUri();
  await startApi();
});

afterAll(async () => {
  await disconnectDatabase();
  await externalDatabase.stop();
});

describe('Banco persistente: dados preservados após reinicializações', () => {
  it('mantém jogador, investigação, progresso e histórico; o catálogo não duplica', async () => {
    const missionIdsBefore = await MissionModel.find().sort({ order: 1 }).select('_id').lean();
    expect(missionIdsBefore).toHaveLength(10);

    const email = 'persistencia@example.com';
    const registered = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana Souza', email, password: PASSWORD });
    expect(registered.status).toBe(201);
    const token = registered.body.data.token as string;

    const started = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-008' });
    expect(started.status).toBe(201);
    const investigationId = started.body.data.id as string;
    expect(
      (
        await request(app)
          .post(`/api/investigations/${investigationId}/evidences/ev-01/analysis`)
          .set(bearer(token))
      ).status,
    ).toBe(200);

    await restartApi();
    await restartApi();

    // Catálogo: 10 missões, mesmos _id (nada recriado), nenhuma duplicada.
    const missionIdsAfter = await MissionModel.find().sort({ order: 1 }).select('_id').lean();
    expect(missionIdsAfter.map((m) => String(m._id))).toEqual(
      missionIdsBefore.map((m) => String(m._id)),
    );
    const catalog = await request(app).get('/api/missions');
    expect(catalog.body.data).toHaveLength(10);

    // Jogador: login funciona com a mesma senha; o token anterior continua válido
    // porque o segredo JWT é o mesmo (configurado no ambiente).
    const login = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
    expect(login.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set(bearer(token));
    expect(me.status).toBe(200);

    // Investigação e progresso preservados; histórico lista a tentativa.
    const progress = await request(app)
      .get(`/api/investigations/${investigationId}`)
      .set(bearer(login.body.data.token));
    expect(progress.body.data.status).toBe('EM_ANDAMENTO');
    expect(progress.body.data.progress.analyzedEvidences).toBe(1);
    const history = await request(app).get('/api/investigations').set(bearer(token));
    expect(history.body.data.map((item: { id: string }) => item.id)).toContain(investigationId);

    // Continuidade: iniciar a mesma missão aponta para a tentativa em andamento.
    const again = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-008' });
    expect(again.status).toBe(409);
    expect(again.body.error.details.investigationId).toBe(investigationId);
  });

  it('a carga do catálogo atualiza o conteúdo existente sem recriar a missão', async () => {
    const original = await MissionModel.findOne({ missionId: 'missao-004' }).lean();
    await MissionModel.updateOne({ missionId: 'missao-004' }, { $set: { title: 'Título antigo' } });

    await restartApi();

    const restored = await MissionModel.findOne({ missionId: 'missao-004' }).lean();
    expect(String(restored!._id)).toBe(String(original!._id));
    expect(restored!.title).toBe(
      DEMO_MISSIONS.find((mission) => mission.missionId === 'missao-004')!.title,
    );
    expect(await MissionModel.countDocuments()).toBe(10);
  });

  it('não cria usuários demonstrativos quando desativados (padrão em produção)', async () => {
    expect(
      await UserModel.countDocuments({
        email: { $in: ['sofia@example.com', 'bruno@example.com', 'livia@example.com'] },
      }),
    ).toBe(0);
  });

  it('cria os índices no banco persistente (investigação ativa única por jogador e missão)', async () => {
    const indexes = await MissionModel.db.collection('investigations').indexes();
    expect(indexes.some((index) => index.unique && index.partialFilterExpression)).toBe(true);
  });
});
