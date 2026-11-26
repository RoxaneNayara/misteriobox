import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import type { Mission } from '../../src/models/mission.model';

const PASSWORD = 'Detetive2026';
let app: Express;
let emailSequence = 0;

async function registerPlayer(): Promise<string> {
  emailSequence += 1;
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ana Souza', email: `catalogo${emailSequence}@example.com`, password: PASSWORD });
  expect(response.status).toBe(201);
  return response.body.data.token as string;
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Ordem em que as evidências podem ser analisadas respeitando os pré-requisitos (RN03). */
function unlockOrder(mission: Mission, target: string): string[] {
  const byId = new Map(mission.evidences.map((evidence) => [evidence.evidenceId, evidence]));
  const order: string[] = [];
  const visit = (id: string) => {
    if (order.includes(id)) return;
    byId.get(id)!.requires.forEach(visit);
    order.push(id);
  };
  visit(target);
  // Completa o mínimo de 3 evidências para a acusação (RN04), se necessário.
  for (const evidence of mission.evidences) {
    if (order.length >= 3) break;
    if (evidence.requires.length === 0) visit(evidence.evidenceId);
  }
  return order;
}

async function startMission(token: string, missionId: string) {
  const response = await request(app)
    .post('/api/investigations')
    .set(bearer(token))
    .send({ missionId });
  expect(response.status).toBe(201);
  return response.body.data;
}

async function analyze(token: string, investigationId: string, evidenceId: string) {
  return request(app)
    .post(`/api/investigations/${investigationId}/evidences/${evidenceId}/analysis`)
    .set(bearer(token));
}

beforeAll(async () => {
  await connectDatabase();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Catálogo pela API', () => {
  it('lista as 10 missões em ordem, com a distribuição 3/3/4 e sem expor a solução', async () => {
    const response = await request(app).get('/api/missions');
    expect(response.status).toBe(200);
    const missions = response.body.data as Array<Record<string, unknown>>;
    expect(missions.map((mission) => mission.id)).toEqual(
      DEMO_MISSIONS.map((mission) => mission.missionId),
    );
    const count = (difficulty: string) =>
      missions.filter((mission) => mission.difficulty === difficulty).length;
    expect([count('FACIL'), count('MEDIO'), count('DIFICIL')]).toEqual([3, 3, 4]);
    expect(JSON.stringify(response.body)).not.toMatch(/solution|culprit|explanation/i);
  });

  it.each(DEMO_MISSIONS.map((mission) => mission.missionId))(
    'detalhe de %s não revela a solução',
    async (missionId) => {
      const response = await request(app).get(`/api/missions/${missionId}`);
      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toMatch(/solution|culprit|explanation|decisive/i);
    },
  );
});

describe('Fluxo completo das novas missões', () => {
  const newMissions = DEMO_MISSIONS.filter((mission) => mission.order >= 4);

  it.each(newMissions.map((mission) => [mission.missionId, mission] as const))(
    '%s pode ser solucionada com a pontuação máxima seguindo as dependências',
    async (_id, mission) => {
      const token = await registerPlayer();
      const investigation = await startMission(token, mission.missionId);

      for (const evidenceId of unlockOrder(mission, mission.solution.decisiveEvidenceId)) {
        const response = await analyze(token, investigation.id, evidenceId);
        expect(response.status, `${mission.missionId} ${evidenceId}`).toBe(200);
      }

      const accusation = await request(app)
        .post(`/api/investigations/${investigation.id}/accusation`)
        .set(bearer(token))
        .send({
          suspectId: mission.solution.culpritSuspectId,
          evidenceId: mission.solution.decisiveEvidenceId,
        });
      expect(accusation.status).toBe(200);
      expect(accusation.body.data.status).toBe('SOLUCIONADO');
      expect(accusation.body.data.score).toBe(100);
      expect(accusation.body.data.classification).toBe('Detetive Mestre');
    },
  );

  it('missao-008: bloqueia evidência sem pré-requisito, pune acusação errada e permite nova tentativa', async () => {
    const mission = DEMO_MISSIONS.find((m) => m.missionId === 'missao-008')!;
    const token = await registerPlayer();
    const first = await startMission(token, 'missao-008');

    // A cópia imutável (ev-07) exige o registro da VPN e os metadados (RN03).
    const locked = await analyze(token, first.id, 'ev-07');
    expect(locked.status).toBe(422);
    expect(locked.body.error.code).toBe('EVIDENCE_LOCKED');

    // O relatório interno, as catracas e a proposta a Paula sustentam hipóteses falsas.
    for (const evidenceId of ['ev-01', 'ev-02', 'ev-10']) {
      expect((await analyze(token, first.id, evidenceId)).status).toBe(200);
    }
    const wrong = await request(app)
      .post(`/api/investigations/${first.id}/accusation`)
      .set(bearer(token))
      .send({ suspectId: 'igor-sa', evidenceId: 'ev-01' });
    expect(wrong.status).toBe(200);
    expect(wrong.body.data.status).toBe('NAO_SOLUCIONADO');
    expect(wrong.body.data.score).toBe(0);

    // Replay: nova tentativa começa do zero, sem alterar a anterior.
    const second = await startMission(token, 'missao-008');
    expect(second.id).not.toBe(first.id);
    expect(second.status).toBe('EM_ANDAMENTO');
    expect(second.progress.analyzedEvidences).toBe(0);
    expect(second.hints.used).toEqual([]);

    const hint = await request(app)
      .post(`/api/investigations/${second.id}/hints`)
      .set(bearer(token));
    expect(hint.status).toBe(200);

    for (const evidenceId of unlockOrder(mission, 'ev-08')) {
      expect((await analyze(token, second.id, evidenceId)).status).toBe(200);
    }
    const right = await request(app)
      .post(`/api/investigations/${second.id}/accusation`)
      .set(bearer(token))
      .send({ suspectId: 'leandro-faria', evidenceId: 'ev-08' });
    expect(right.body.data.status).toBe('SOLUCIONADO');
    expect(right.body.data.score).toBe(90);

    // Histórico e catálogo refletem as duas tentativas; a primeira continua intacta.
    const history = await request(app).get('/api/investigations').set(bearer(token));
    const attempts = (history.body.data as Array<Record<string, unknown>>).filter(
      (item) => (item.mission as { id: string }).id === 'missao-008',
    );
    expect(attempts.map((item) => [item.attemptNumber, item.status, item.score])).toEqual([
      [2, 'SOLUCIONADO', 90],
      [1, 'NAO_SOLUCIONADO', 0],
    ]);
    const firstResult = await request(app)
      .get(`/api/investigations/${first.id}/result`)
      .set(bearer(token));
    expect(firstResult.body.data.score).toBe(0);

    const catalog = await request(app).get('/api/missions').set(bearer(token));
    const item = (catalog.body.data as Array<Record<string, unknown>>).find(
      (entry) => entry.id === 'missao-008',
    )!;
    expect(item.totalAttempts).toBe(2);
    expect(item.investigation).toMatchObject({ id: second.id, status: 'SOLUCIONADO' });
  });
});
