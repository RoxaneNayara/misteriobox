import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import type { Mission } from '../../src/models/mission.model';

/**
 * Revelação da solução somente com 50 pontos ou mais. Cada resultado vem de uma partida real
 * pela API (suspeito, evidência e dicas escolhidos); nenhuma pontuação é injetada.
 */
const PASSWORD = 'Detetive2026';
let app: Express;
let sequence = 0;

const missionById = (id: string) => DEMO_MISSIONS.find((mission) => mission.missionId === id)!;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

async function registerPlayer(): Promise<string> {
  sequence += 1;
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ana Souza', email: `revelacao${sequence}@example.com`, password: PASSWORD });
  expect(response.status).toBe(201);
  return response.body.data.token as string;
}

/** Evidências a analisar, na ordem dos pré-requisitos, até a evidência acusada (mínimo de 3). */
function analysisOrder(mission: Mission, target: string): string[] {
  const byId = new Map(mission.evidences.map((evidence) => [evidence.evidenceId, evidence]));
  const order: string[] = [];
  const visit = (id: string) => {
    if (order.includes(id)) return;
    byId.get(id)!.requires.forEach(visit);
    order.push(id);
  };
  visit(target);
  for (const evidence of mission.evidences) {
    if (order.length >= 3) break;
    if (evidence.requires.length === 0) visit(evidence.evidenceId);
  }
  return order;
}

interface Play {
  missionId: string;
  suspectId: string;
  evidenceId: string;
  hints: number;
}

/** Joga uma tentativa completa e devolve o id e a resposta da acusação. */
async function play(token: string, { missionId, suspectId, evidenceId, hints }: Play) {
  const mission = missionById(missionId);
  const started = await request(app)
    .post('/api/investigations')
    .set(bearer(token))
    .send({ missionId });
  expect(started.status).toBe(201);
  const id = started.body.data.id as string;
  for (let hint = 0; hint < hints; hint += 1) {
    expect(
      (await request(app).post(`/api/investigations/${id}/hints`).set(bearer(token))).status,
    ).toBe(200);
  }
  for (const evidence of analysisOrder(mission, evidenceId)) {
    const analyzed = await request(app)
      .post(`/api/investigations/${id}/evidences/${evidence}/analysis`)
      .set(bearer(token));
    expect(analyzed.status).toBe(200);
  }
  const accused = await request(app)
    .post(`/api/investigations/${id}/accusation`)
    .set(bearer(token))
    .send({ suspectId, evidenceId });
  expect(accused.status).toBe(200);
  return { id, accusation: accused.body.data };
}

/** Textos secretos da missão que não podem aparecer em nenhuma resposta abaixo de 50 pontos. */
function secretsOf(mission: Mission, accusedSuspectId: string, accusedEvidenceId: string) {
  const culprit = mission.suspects.find((s) => s.suspectId === mission.solution.culpritSuspectId)!;
  const decisive = mission.evidences.find(
    (e) => e.evidenceId === mission.solution.decisiveEvidenceId,
  )!;
  const secrets = [mission.solution.explanation];
  // O nome do culpado e a evidência decisiva só são segredo se o jogador não os escolheu.
  if (accusedSuspectId !== culprit.suspectId) secrets.push(culprit.name);
  if (accusedEvidenceId !== decisive.evidenceId) secrets.push(decisive.title);
  return secrets;
}

async function expectHidden(token: string, id: string, game: Play, body: Record<string, unknown>) {
  expect(body.solution).toBeNull();
  expect(body.solutionRevealed).toBe(false);
  expect(body.solutionRevealMinScore).toBe(50);
  const mission = missionById(game.missionId);
  // Relatório (acusação e consulta posterior) e histórico: nenhum dado da solução.
  const reportResponses = [
    JSON.stringify(body),
    JSON.stringify(
      (await request(app).get(`/api/investigations/${id}/result`).set(bearer(token))).body,
    ),
    JSON.stringify((await request(app).get('/api/investigations').set(bearer(token))).body),
  ];
  for (const text of reportResponses) {
    for (const secret of secretsOf(mission, game.suspectId, game.evidenceId)) {
      expect(text).not.toContain(secret);
    }
    expect(text).not.toMatch(/"culprit"|"decisiveEvidence"|"explanation"/);
  }
  // Catálogo e detalhe da missão: públicos (listam os suspeitos), mas nunca a solução.
  const publicResponses = [
    JSON.stringify((await request(app).get('/api/missions').set(bearer(token))).body),
    JSON.stringify((await request(app).get(`/api/missions/${game.missionId}`)).body),
  ];
  for (const text of publicResponses) {
    expect(text).not.toContain(mission.solution.explanation);
    expect(text).not.toMatch(/solution|culprit|decisive|explanation/i);
  }
}

beforeAll(async () => {
  await connectDatabase();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

const M1 = missionById('missao-001');
const M2 = missionById('missao-002');
const M9 = missionById('missao-009');
const nonDecisive = (mission: Mission) =>
  mission.evidences.find(
    (evidence) =>
      evidence.evidenceId !== mission.solution.decisiveEvidenceId && evidence.requires.length === 0,
  )!.evidenceId;
const wrongSuspect = (mission: Mission) =>
  mission.suspects.find((suspect) => suspect.suspectId !== mission.solution.culpritSuspectId)!
    .suspectId;

describe('Relatório final — revelação da solução a partir de 50 pontos', () => {
  it('100 pontos (suspeito e evidência decisiva corretos, sem dicas): revela a solução', async () => {
    const token = await registerPlayer();
    const { accusation } = await play(token, {
      missionId: 'missao-001',
      suspectId: M1.solution.culpritSuspectId,
      evidenceId: M1.solution.decisiveEvidenceId,
      hints: 0,
    });
    expect(accusation.score).toBe(100);
    expect(accusation.solutionRevealed).toBe(true);
    expect(accusation.solution.culprit.id).toBe(M1.solution.culpritSuspectId);
    expect(accusation.solution.decisiveEvidence.id).toBe(M1.solution.decisiveEvidenceId);
    expect(accusation.solution.explanation).toBe(M1.solution.explanation);
  });

  it('50 pontos (limite; suspeito correto, evidência não decisiva, 2 dicas): revela a solução', async () => {
    const token = await registerPlayer();
    const { id, accusation } = await play(token, {
      missionId: 'missao-001',
      suspectId: M1.solution.culpritSuspectId,
      evidenceId: nonDecisive(M1),
      hints: 2,
    });
    expect(accusation.score).toBe(50);
    expect(accusation.solutionRevealed).toBe(true);
    expect(accusation.solution.explanation).toBe(M1.solution.explanation);
    const report = await request(app).get(`/api/investigations/${id}/result`).set(bearer(token));
    expect(report.body.data.solution.decisiveEvidence.id).toBe(M1.solution.decisiveEvidenceId);
  });

  it('40 pontos (maior valor alcançável abaixo de 50): oculta a solução em todos os endpoints', async () => {
    const token = await registerPlayer();
    const game = {
      missionId: 'missao-002',
      suspectId: M2.solution.culpritSuspectId,
      evidenceId: nonDecisive(M2),
      hints: 3,
    };
    const { id, accusation } = await play(token, game);
    expect(accusation.score).toBe(40);
    expect(accusation.classification).toBe('Detetive Aprendiz');
    // Pontuação, classificação e acusação do próprio jogador continuam disponíveis.
    expect(accusation.scoreBreakdown).toEqual({
      suspectPoints: 70,
      evidenceBonus: 0,
      hintPenalty: 30,
    });
    expect(accusation.accusation.suspect.id).toBe(game.suspectId);
    await expectHidden(token, id, game, accusation);
  });

  it('30 pontos (4 dicas) oculta; 60 pontos (decisiva com 4 dicas) revela', async () => {
    const token = await registerPlayer();
    const low = {
      missionId: 'missao-009',
      suspectId: M9.solution.culpritSuspectId,
      evidenceId: nonDecisive(M9),
      hints: 4,
    };
    const first = await play(token, low);
    expect(first.accusation.score).toBe(30);
    await expectHidden(token, first.id, low, first.accusation);

    const second = await play(token, { ...low, evidenceId: M9.solution.decisiveEvidenceId });
    expect(second.accusation.score).toBe(60);
    expect(second.accusation.solutionRevealed).toBe(true);
  });

  it('0 ponto (suspeito errado): não revela o culpado nem a explicação', async () => {
    const token = await registerPlayer();
    const game = {
      missionId: 'missao-001',
      suspectId: wrongSuspect(M1),
      evidenceId: nonDecisive(M1),
      hints: 0,
    };
    const { id, accusation } = await play(token, game);
    expect(accusation.score).toBe(0);
    expect(accusation.status).toBe('NAO_SOLUCIONADO');
    await expectHidden(token, id, game, accusation);
  });

  it('relatório antigo abaixo de 50 continua oculto depois de uma nova tentativa com 100 pontos', async () => {
    const token = await registerPlayer();
    const lowGame = {
      missionId: 'missao-002',
      suspectId: wrongSuspect(M2),
      evidenceId: nonDecisive(M2),
      hints: 1,
    };
    const old = await play(token, lowGame);
    expect(old.accusation.score).toBe(0);

    const replay = await play(token, {
      missionId: 'missao-002',
      suspectId: M2.solution.culpritSuspectId,
      evidenceId: M2.solution.decisiveEvidenceId,
      hints: 0,
    });
    expect(replay.accusation.score).toBe(100);
    expect(replay.accusation.solutionRevealed).toBe(true);

    const oldReport = await request(app)
      .get(`/api/investigations/${old.id}/result`)
      .set(bearer(token));
    expect(oldReport.body.data.solution).toBeNull();
    expect(oldReport.body.data.solutionRevealed).toBe(false);
    const history = await request(app).get('/api/investigations').set(bearer(token));
    expect(
      history.body.data.filter(
        (item: { mission: { id: string } }) => item.mission.id === 'missao-002',
      ),
    ).toHaveLength(2);
  });

  it('investigação abandonada nunca revela a solução', async () => {
    const token = await registerPlayer();
    const started = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-001' });
    const id = started.body.data.id as string;
    await request(app).post(`/api/investigations/${id}/abandon`).set(bearer(token));
    const report = await request(app).get(`/api/investigations/${id}/result`).set(bearer(token));
    expect(report.body.data.solution).toBeNull();
    expect(report.body.data.solutionRevealed).toBe(false);
    expect(JSON.stringify(report.body)).not.toContain(M1.solution.explanation);
  });
});
