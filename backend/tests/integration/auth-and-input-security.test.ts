import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/database/connection';
import { seedDatabase } from '../../src/database/seed';
import { NAME_POLICY_MESSAGE } from '../../src/validators/auth.validator';

let app: Express;
let emailSequence = 0;

function uniqueEmail(prefix = 'detetive'): string {
  emailSequence += 1;
  return `${prefix}${emailSequence}@example.com`;
}

async function registerUser(overrides: Record<string, unknown> = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ name: 'Ana Souza', email: uniqueEmail(), password: 'Detetive2026', ...overrides });
}

beforeAll(async () => {
  await connectDatabase();
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('POST /api/auth/register — política do nome (B01)', () => {
  it.each(['Conceição Gonçalves', "D'Ávila", 'Ana-Maria', 'O’Neil'])(
    'cadastra o nome válido "%s"',
    async (name) => {
      const response = await registerUser({ name });
      expect(response.status).toBe(201);
      expect(response.body.data.user.name).toBe(name);
    },
  );

  it.each(['1a*, ?, /, ,)', 'Ana*', 'Ana?', 'Ana/Maria', '<img src=x onerror=alert(1)>'])(
    'recusa o nome inválido "%s" com mensagem amigável',
    async (name) => {
      const response = await registerUser({ name });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContainEqual({
        field: 'name',
        message: NAME_POLICY_MESSAGE,
      });
    },
  );

  it('aceita nome longo sem espaços com 80 caracteres (B02 é corrigido no layout)', async () => {
    const name = 'Flavio' + 'F'.repeat(74);
    const response = await registerUser({ name });
    expect(response.status).toBe(201);
    expect(response.body.data.user.name).toHaveLength(80);
  });
});

describe('Regressão B03 — espaços externos em nome e e-mail', () => {
  it('cadastra com espaços externos e devolve os valores normalizados', async () => {
    const email = uniqueEmail('normalizado');
    const response = await registerUser({
      name: '   Ana Souza   ',
      email: `   ${email.toUpperCase()}   `,
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user.name).toBe('Ana Souza');
    expect(response.body.data.user.email).toBe(email);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${response.body.data.token}`);
    expect(me.body.data.name).toBe('Ana Souza');
    expect(me.body.data.email).toBe(email);
  });

  it('permite login com espaços externos no e-mail', async () => {
    const email = uniqueEmail('login');
    await registerUser({ email });
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: `  ${email}  `, password: 'Detetive2026' });
    expect(response.status).toBe(200);
  });

  it('trata o e-mail com espaços externos como o mesmo e-mail (sem duplicidade)', async () => {
    const email = uniqueEmail('duplicado');
    expect((await registerUser({ email })).status).toBe(201);
    const duplicate = await registerUser({ email: `  ${email}  ` });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it("aceita e-mail com dois apóstrofos consecutivos (mariansa''llaw@example.com)", async () => {
    const response = await registerUser({ email: "  mariansa''llaw@example.com " });
    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe("mariansa''llaw@example.com");
  });
});

describe('Senha — sem trim e sem truncamento silencioso do bcrypt', () => {
  it('não remove espaços da senha', async () => {
    const email = uniqueEmail('espacos');
    await registerUser({ email, password: '  Detetive2026  ' });
    const withSpaces = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '  Detetive2026  ' });
    const withoutSpaces = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Detetive2026' });
    expect(withSpaces.status).toBe(200);
    expect(withoutSpaces.status).toBe(401);
  });

  it('recusa no cadastro senha acima de 72 bytes, mesmo com até 72 caracteres', async () => {
    const response = await registerUser({ password: 'a1' + 'ç'.repeat(36) });
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].field).toBe('password');
  });

  it('recusa no login uma senha que só difere da cadastrada após o 72º byte', async () => {
    const email = uniqueEmail('bcrypt');
    const password72Bytes = 'a1' + 'ç'.repeat(35);
    expect((await registerUser({ email, password: password72Bytes })).status).toBe(201);
    const exact = await request(app)
      .post('/api/auth/login')
      .send({ email, password: password72Bytes });
    const withSuffix = await request(app)
      .post('/api/auth/login')
      .send({ email, password: password72Bytes + 'qualquer-coisa' });
    expect(exact.status).toBe(200);
    expect(withSuffix.status).toBe(401);
    expect(withSuffix.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Entradas estruturadas — prevenção de NoSQL Injection', () => {
  it('recusa operadores do MongoDB no login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('recusa operador no campo e-mail com senha válida', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'Detetive2026' });
    expect(response.status).toBe(400);
  });

  it('recusa objetos e campos extras no cadastro', async () => {
    const asObject = await registerUser({ name: { $ne: '' } });
    const extraField = await registerUser({ $where: 'sleep(1000)' });
    expect(asObject.status).toBe(400);
    expect(extraField.status).toBe(400);
  });

  it('recusa operadores ao iniciar investigação e na acusação', async () => {
    const { body } = await registerUser();
    const auth = { Authorization: `Bearer ${body.data.token}` };

    const start = await request(app)
      .post('/api/investigations')
      .set(auth)
      .send({ missionId: { $ne: null } });
    expect(start.status).toBe(400);

    const created = await request(app)
      .post('/api/investigations')
      .set(auth)
      .send({ missionId: 'missao-001' });
    expect(created.status).toBe(201);

    const accusation = await request(app)
      .post(`/api/investigations/${created.body.data.id}/accusation`)
      .set(auth)
      .send({ suspectId: { $ne: null }, evidenceId: { $ne: null } });
    expect(accusation.status).toBe(400);
  });
});

describe('Exibição de dados do usuário — XSS', () => {
  it('responde sempre JSON (nunca HTML), inclusive ao refletir o caminho em 404', async () => {
    const response = await request(app).get('/api/%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
