import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';

/**
 * Lacunas de automação apontadas na auditoria (RN01, RN04, RN07 e RN08), verificando o
 * comportamento já implementado — sem alterar regras:
 * - acesso à investigação de outro jogador (403) sem efeitos colaterais;
 * - recusas da acusação (422) e segunda acusação (409);
 * - bloqueio de ações após o encerramento por acusação ou abandono (409);
 * - requisições simultâneas para iniciar a mesma missão (uma 201, demais 409, nunca 500).
 * Nenhum teste depende do culpado: os cenários funcionam com qualquer suspeito.
 */
const PASSWORD = 'Detetive2026';
const MISSION_ID = 'missao-001';
const mission = DEMO_MISSIONS.find((item) => item.missionId === MISSION_ID)!;
const initialEvidences = mission.evidences
  .filter((evidence) => evidence.requires.length === 0)
  .map((evidence) => evidence.evidenceId);
const anySuspect = mission.suspects[0].suspectId;

let app: Express;
let sequence = 0;

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

async function registerPlayer(): Promise<string> {
  sequence += 1;
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ana Souza', email: `lacunas${sequence}@example.com`, password: PASSWORD });
  expect(response.status).toBe(201);
  return response.body.data.token as string;
}

async function startMission(token: string): Promise<string> {
  const response = await request(app)
    .post('/api/investigations')
    .set(bearer(token))
    .send({ missionId: MISSION_ID });
  expect(response.status).toBe(201);
  return response.body.data.id as string;
}

async function analyze(token: string, id: string, evidenceId: string) {
  return request(app)
    .post(`/api/investigations/${id}/evidences/${evidenceId}/analysis`)
    .set(bearer(token));
}

async function progressOf(token: string, id: string) {
  const response = await request(app).get(`/api/investigations/${id}`).set(bearer(token));
  expect(response.status).toBe(200);
  return response.body.data;
}

beforeAll(async () => {
  expect(initialEvidences.length).toBeGreaterThanOrEqual(3);
  await connectDatabase();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('RN01 — investigação de outro jogador', () => {
  it('recusa leitura e todas as ações com 403, sem alterar a investigação', async () => {
    const owner = await registerPlayer();
    const intruder = await registerPlayer();
    const id = await startMission(owner);
    expect((await analyze(owner, id, initialEvidences[0])).status).toBe(200);
    const before = await progressOf(owner, id);

    const attempts = [
      request(app).get(`/api/investigations/${id}`).set(bearer(intruder)),
      request(app).get(`/api/investigations/${id}/result`).set(bearer(intruder)),
      request(app)
        .post(`/api/investigations/${id}/evidences/${initialEvidences[1]}/analysis`)
        .set(bearer(intruder)),
      request(app).post(`/api/investigations/${id}/hints`).set(bearer(intruder)),
      request(app).post(`/api/investigations/${id}/abandon`).set(bearer(intruder)),
      request(app)
        .post(`/api/investigations/${id}/accusation`)
        .set(bearer(intruder))
        .send({ suspectId: anySuspect, evidenceId: initialEvidences[0] }),
    ];
    for (const response of await Promise.all(attempts)) {
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(JSON.stringify(response.body)).not.toContain(initialEvidences[0]);
    }

    expect(await progressOf(owner, id)).toEqual(before);
    const history = await request(app).get('/api/investigations').set(bearer(intruder));
    expect(history.body.data.map((item: { id: string }) => item.id)).not.toContain(id);
  });

  it('identificador inexistente responde 404 e malformado responde 400', async () => {
    const token = await registerPlayer();
    const missing = await request(app)
      .get('/api/investigations/0123456789abcdef01234567')
      .set(bearer(token));
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('INVESTIGATION_NOT_FOUND');
    const malformed = await request(app).get('/api/investigations/abc').set(bearer(token));
    expect(malformed.status).toBe(400);
  });
});

describe('RN04 — recusas da acusação', () => {
  it('recusa acusações inválidas sem encerrar a investigação; a segunda acusação é recusada', async () => {
    const token = await registerPlayer();
    const id = await startMission(token);
    const accuse = (body: object) =>
      request(app).post(`/api/investigations/${id}/accusation`).set(bearer(token)).send(body);

    // Menos de três evidências analisadas.
    for (const evidenceId of initialEvidences.slice(0, 2)) {
      expect((await analyze(token, id, evidenceId)).status).toBe(200);
    }
    const tooEarly = await accuse({ suspectId: anySuspect, evidenceId: initialEvidences[0] });
    expect(tooEarly.status).toBe(422);
    expect(tooEarly.body.error).toMatchObject({
      code: 'INSUFFICIENT_EVIDENCES',
      details: { analyzedEvidences: 2, minimumForAccusation: 3 },
    });

    expect((await analyze(token, id, initialEvidences[2])).status).toBe(200);

    const unknownSuspect = await accuse({
      suspectId: 'suspeito-inexistente',
      evidenceId: initialEvidences[0],
    });
    expect(unknownSuspect.status).toBe(422);
    expect(unknownSuspect.body.error.code).toBe('INVALID_SUSPECT');

    const notAnalyzed = mission.evidences.find(
      (evidence) => !initialEvidences.slice(0, 3).includes(evidence.evidenceId),
    )!.evidenceId;
    const unanalyzed = await accuse({ suspectId: anySuspect, evidenceId: notAnalyzed });
    expect(unanalyzed.status).toBe(422);
    expect(unanalyzed.body.error.code).toBe('EVIDENCE_NOT_ANALYZED');

    const withScore = await accuse({
      suspectId: anySuspect,
      evidenceId: initialEvidences[0],
      score: 100,
    });
    expect(withScore.status).toBe(400);
    expect(withScore.body.error.code).toBe('VALIDATION_ERROR');

    const missingFields = await accuse({});
    expect(missingFields.status).toBe(400);

    const stillOpen = await progressOf(token, id);
    expect(stillOpen.status).toBe('EM_ANDAMENTO');

    const valid = await accuse({ suspectId: anySuspect, evidenceId: initialEvidences[0] });
    expect(valid.status).toBe(200);
    const second = await accuse({ suspectId: anySuspect, evidenceId: initialEvidences[0] });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('INVESTIGATION_FINISHED');
  });
});

describe('RN07/RN08 — ações após o encerramento', () => {
  async function expectAllActionsBlocked(token: string, id: string, status: string) {
    const nextEvidence = initialEvidences[initialEvidences.length - 1];
    const responses = await Promise.all([
      analyze(token, id, nextEvidence),
      request(app).post(`/api/investigations/${id}/hints`).set(bearer(token)),
      request(app).post(`/api/investigations/${id}/abandon`).set(bearer(token)),
      request(app)
        .post(`/api/investigations/${id}/accusation`)
        .set(bearer(token))
        .send({ suspectId: anySuspect, evidenceId: initialEvidences[0] }),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(409);
      expect(response.body.error).toMatchObject({
        code: 'INVESTIGATION_FINISHED',
        details: { status },
      });
    }
  }

  it('encerrada por acusação: análise, dica, abandono e nova acusação recebem 409', async () => {
    const token = await registerPlayer();
    const id = await startMission(token);
    for (const evidenceId of initialEvidences.slice(0, 3)) await analyze(token, id, evidenceId);
    const accused = await request(app)
      .post(`/api/investigations/${id}/accusation`)
      .set(bearer(token))
      .send({ suspectId: anySuspect, evidenceId: initialEvidences[0] });
    expect(accused.status).toBe(200);
    const finalStatus = accused.body.data.status as string;
    const before = await progressOf(token, id);

    await expectAllActionsBlocked(token, id, finalStatus);
    expect(await progressOf(token, id)).toEqual(before);
  });

  it('abandonada: sem pontuação e sem novas ações; nova tentativa começa do zero', async () => {
    const token = await registerPlayer();
    const id = await startMission(token);
    await analyze(token, id, initialEvidences[0]);
    const abandoned = await request(app)
      .post(`/api/investigations/${id}/abandon`)
      .set(bearer(token));
    expect(abandoned.status).toBe(200);
    expect(abandoned.body.data.status).toBe('ABANDONADO');

    await expectAllActionsBlocked(token, id, 'ABANDONADO');

    const retry = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: MISSION_ID });
    expect(retry.status).toBe(201);
    expect(retry.body.data.id).not.toBe(id);
    expect(retry.body.data.progress.analyzedEvidences).toBe(0);
    const history = await request(app).get('/api/investigations').set(bearer(token));
    const old = history.body.data.find((item: { id: string }) => item.id === id);
    expect(old).toMatchObject({ status: 'ABANDONADO', score: null, analyzedEvidences: 1 });
  });
});

describe('RN08 — requisições simultâneas para iniciar a mesma missão', () => {
  it('apenas uma tentativa é criada; as demais recebem 409 (nunca 500)', async () => {
    const token = await registerPlayer();
    const responses = await Promise.all(
      Array.from({ length: 8 }, () =>
        request(app).post('/api/investigations').set(bearer(token)).send({ missionId: MISSION_ID }),
      ),
    );
    const statuses = responses.map((response) => response.status);
    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.every((status) => status === 201 || status === 409)).toBe(true);

    const created = responses.find((response) => response.status === 201)!.body.data.id;
    for (const response of responses.filter((item) => item.status === 409)) {
      expect(['INVESTIGATION_ALREADY_EXISTS', 'CONCURRENT_UPDATE']).toContain(
        response.body.error.code,
      );
      if (response.body.error.code === 'INVESTIGATION_ALREADY_EXISTS') {
        expect(response.body.error.details.investigationId).toBe(created);
      }
    }

    const history = await request(app).get('/api/investigations').set(bearer(token));
    const active = history.body.data.filter(
      (item: { mission: { id: string }; status: string }) =>
        item.mission.id === MISSION_ID && item.status === 'EM_ANDAMENTO',
    );
    expect(active).toHaveLength(1);
  });

  it('jogadores diferentes iniciam a mesma missão ao mesmo tempo sem interferência', async () => {
    const tokens = await Promise.all([registerPlayer(), registerPlayer(), registerPlayer()]);
    const responses = await Promise.all(
      tokens.map((token) =>
        request(app).post('/api/investigations').set(bearer(token)).send({ missionId: MISSION_ID }),
      ),
    );
    expect(responses.map((response) => response.status)).toEqual([201, 201, 201]);
  });
});
