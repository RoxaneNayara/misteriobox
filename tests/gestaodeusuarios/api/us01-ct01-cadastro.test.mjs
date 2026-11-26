import request from 'supertest';
import { expect } from 'chai';

describe('US01-CT01 - Cadastro de jogador com dados válidos', () => {
  it('Deve cadastrar um jogador com dados válidos', async () => {
    const email = `detetive.${Date.now()}@example.com`;

    const resposta = await request('http://localhost:3333').post('/api/auth/register').send({
      name: 'Ana Silva',
      email: email,
      password: 'SenhaTeste123',
    });

    expect(resposta.status).to.equal(201);

    expect(resposta.body.data.user.name).to.equal('Ana Silva');

    expect(resposta.body.data.user.email).to.equal(email);
  });
});
