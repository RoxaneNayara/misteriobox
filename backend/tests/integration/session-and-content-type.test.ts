import type { Express } from 'express';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { userRepository } from '../../src/repositories/user.repository';

const MINUTE = 60 * 1000;
const PASSWORD = 'Detetive2026';

let app: Express;
let emailSequence = 0;

function uniqueEmail(prefix: string): string {
  emailSequence += 1;
  return `${prefix}${emailSequence}@example.com`;
}

async function registerAndLogin(prefix = 'sessao') {
  const email = uniqueEmail(prefix);
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ana Souza', email, password: PASSWORD });
  expect(response.status).toBe(201);
  return { email, token: response.body.data.token as string, session: response.body.data };
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Avança somente o relógio (Date); temporizadores e o banco continuam normais. */
function travelTo(timestamp: number): void {
  vi.setSystemTime(timestamp);
}

beforeAll(async () => {
  await connectDatabase();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('B04 — expiração por inatividade (30 min) e limite absoluto (8 h)', () => {
  it('informa a política de sessão no login', async () => {
    const { session } = await registerAndLogin();
    expect(session.idleTimeoutSeconds).toBe(1800);
    expect(session.expiresIn).toBe(1800);
    expect(new Date(session.sessionExpiresAt).getTime() - Date.now()).toBeGreaterThan(
      7.9 * 60 * MINUTE,
    );
  });

  it('aceita o token antes de 30 min sem atividade e recusa depois', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = Date.now();
    const { token } = await registerAndLogin();

    travelTo(start + 29 * MINUTE);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(200);

    travelTo(start + 31 * MINUTE);
    const expired = await request(app).get('/api/auth/me').set(bearer(token));
    expect(expired.status).toBe(401);
    expect(expired.body.error.code).toBe('SESSION_EXPIRED');
  });

  it('a renovação desliza a janela de inatividade', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = Date.now();
    const { token } = await registerAndLogin();

    travelTo(start + 20 * MINUTE);
    const refreshed = await request(app).post('/api/auth/refresh').set(bearer(token));
    expect(refreshed.status).toBe(200);
    const renewedToken = refreshed.body.data.token as string;

    travelTo(start + 45 * MINUTE);
    expect((await request(app).get('/api/auth/me').set(bearer(renewedToken))).status).toBe(200);
  });

  it('documenta o logout: token antigo continua válido só até a própria expiração', async () => {
    // O logout é feito no cliente (o token é descartado). Um token copiado antes
    // do logout continua aceito até expirar — no máximo 30 min sem renovação.
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = Date.now();
    const { token } = await registerAndLogin('logout');

    travelTo(start + 10 * MINUTE);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(200);

    travelTo(start + 30 * MINUTE + 1000);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
  });

  it('não ultrapassa 8 h desde o login, mesmo com renovações contínuas', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = Date.now();
    let { token } = await registerAndLogin('absoluto');

    for (let elapsed = 25; elapsed < 8 * 60; elapsed += 25) {
      travelTo(start + elapsed * MINUTE);
      const refreshed = await request(app).post('/api/auth/refresh').set(bearer(token));
      expect(refreshed.status).toBe(200);
      token = refreshed.body.data.token;
      const expiresAt = Date.now() + refreshed.body.data.expiresIn * 1000;
      expect(expiresAt).toBeLessThanOrEqual(start + 8 * 60 * MINUTE + 1000);
    }

    travelTo(start + 8 * 60 * MINUTE + 1000);
    const afterLimit = await request(app).post('/api/auth/refresh').set(bearer(token));
    expect(afterLimit.status).toBe(401);
    expect(afterLimit.body.error.code).toBe('SESSION_EXPIRED');
  });

  it('preserva a investigação em andamento após a sessão expirar e um novo login (RN06)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = Date.now();
    const { email, token } = await registerAndLogin('progresso');

    const started = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-001' });
    const investigationId = started.body.data.id as string;
    await request(app)
      .post(`/api/investigations/${investigationId}/evidences/ev-01/analysis`)
      .set(bearer(token));
    await request(app).post(`/api/investigations/${investigationId}/hints`).set(bearer(token));

    travelTo(start + 31 * MINUTE);
    expect(
      (await request(app).get(`/api/investigations/${investigationId}`).set(bearer(token))).status,
    ).toBe(401);

    const relogin = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
    const progress = await request(app)
      .get(`/api/investigations/${investigationId}`)
      .set(bearer(relogin.body.data.token));

    expect(progress.status).toBe(200);
    expect(progress.body.data.status).toBe('EM_ANDAMENTO');
    expect(progress.body.data.progress.analyzedEvidences).toBe(1);
    expect(progress.body.data.hints.used).toHaveLength(1);
  });

  it('impede cache das respostas da API com dados pessoais', async () => {
    const { token } = await registerAndLogin();
    const me = await request(app).get('/api/auth/me').set(bearer(token));
    expect(me.headers['cache-control']).toBe('no-store');
  });
});

describe('B06 — Content-Type da requisição (415)', () => {
  const unsupportedTypes = ['text/plain', 'text/html', 'application/xml', 'application/javascript'];

  it.each(unsupportedTypes)(
    'recusa cadastro enviado como %s com 415 e não cria o usuário',
    async (contentType) => {
      const email = uniqueEmail('tipo');
      const usersBefore = await userRepository.count();

      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', contentType)
        .send(JSON.stringify({ name: 'Ana Souza', email, password: PASSWORD }));

      expect(response.status).toBe(415);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
      expect(response.body.error.message).toMatch(/application\/json/);
      expect(response.body.error.details.receivedContentType).toBe(contentType);
      expect(await userRepository.count()).toBe(usersBefore);
      expect(await userRepository.existsByEmail(email)).toBe(false);
    },
  );

  it('aceita application/json com charset', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(
        JSON.stringify({ name: 'Ana Souza', email: uniqueEmail('charset'), password: PASSWORD }),
      );
    expect(response.status).toBe(201);
  });

  it('recusa login com tipo não suportado', async () => {
    const { email } = await registerAndLogin('login-tipo');
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify({ email, password: PASSWORD }));
    expect(response.status).toBe(415);
  });

  it('recusa formulário (x-www-form-urlencoded) no cadastro', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .type('form')
      .send({ name: 'Ana Souza', email: uniqueEmail('form'), password: PASSWORD });
    expect(response.status).toBe(415);
  });

  it('recusa início de investigação e acusação com tipo não suportado, sem efeitos no banco', async () => {
    const { token } = await registerAndLogin('rotas');

    const rejectedStart = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .set('Content-Type', 'application/xml')
      .send('<missionId>missao-001</missionId>');
    expect(rejectedStart.status).toBe(415);
    const historyAfterReject = await request(app).get('/api/investigations').set(bearer(token));
    expect(historyAfterReject.body.data).toHaveLength(0);

    const started = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-001' });
    const id = started.body.data.id as string;

    const rejectedAccusation = await request(app)
      .post(`/api/investigations/${id}/accusation`)
      .set(bearer(token))
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify({ suspectId: 'clara-monteiro', evidenceId: 'ev-01' }));
    expect(rejectedAccusation.status).toBe(415);

    const progress = await request(app).get(`/api/investigations/${id}`).set(bearer(token));
    expect(progress.body.data.status).toBe('EM_ANDAMENTO');
  });

  it('não afeta rotas POST sem corpo (dica, abandono, renovação)', async () => {
    const { token } = await registerAndLogin('sem-corpo');
    const started = await request(app)
      .post('/api/investigations')
      .send({ missionId: 'missao-002' })
      .set(bearer(token));
    const id = started.body.data.id as string;

    expect(
      (await request(app).post(`/api/investigations/${id}/hints`).set(bearer(token))).status,
    ).toBe(200);
    expect((await request(app).post('/api/auth/refresh').set(bearer(token))).status).toBe(200);
    expect(
      (await request(app).post(`/api/investigations/${id}/abandon`).set(bearer(token))).status,
    ).toBe(200);
  });

  it('recusa corpo não JSON mesmo em rota que não espera corpo', async () => {
    const { token } = await registerAndLogin('dica-corpo');
    const started = await request(app)
      .post('/api/investigations')
      .set(bearer(token))
      .send({ missionId: 'missao-003' });
    const id = started.body.data.id as string;

    const response = await request(app)
      .post(`/api/investigations/${id}/hints`)
      .set(bearer(token))
      .set('Content-Type', 'text/plain')
      .send('qualquer coisa');
    expect(response.status).toBe(415);
    const progress = await request(app).get(`/api/investigations/${id}`).set(bearer(token));
    expect(progress.body.data.hints.used).toHaveLength(0);
  });
});
