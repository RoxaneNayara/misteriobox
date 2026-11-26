import request from 'supertest';
import { expect } from 'chai';

describe('US02-CT01 - Login com credenciais válidas', () => {
  it('Deve autenticar um jogador cadastrado', async () => {
    const email = `login.${Date.now()}@example.com`;
    const senha = 'SenhaTeste123';

    const cadastro = await request('http://localhost:3333').post('/api/auth/register').send({
      name: 'Ana Silva',
      email: email,
      password: senha,
    });

    expect(cadastro.status).to.equal(201);

    const resposta = await request('http://localhost:3333').post('/api/auth/login').send({
      email: email,
      password: senha,
    });

    expect(resposta.status).to.equal(200);
    expect(resposta.body.data.user.email).to.equal(email);
    expect(resposta.body.data.token).to.be.a('string').and.not.empty;
    expect(resposta.body.data.tokenType).to.equal('Bearer');
  });
});
