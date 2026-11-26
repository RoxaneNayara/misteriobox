import request from 'supertest';
import { expect } from 'chai';

describe('US01-CT04 - Cadastro com dados inválidos', () => {
  it('Deve impedir cadastro com nome inválido', async () => {
    const resposta = await request('http://localhost:3333')
      .post('/api/auth/register')
      .send({
        name: 'Ana123',
        email: `nome.${Date.now()}@example.com`,
        password: 'SenhaTeste123',
      });
    expect(resposta.status).to.equal(400);
    expect(resposta.body.error.code).to.equal('VALIDATION_ERROR');
    expect(resposta.body.error.message).to.equal('Dados da requisição inválidos.');
  });

  it('Deve impedir cadastro com e-mail inválido', async () => {
    const resposta = await request('http://localhost:3333').post('/api/auth/register').send({
      name: 'Ana Silva',
      email: 'email-invalido',
      password: 'SenhaTeste123',
    });
    expect(resposta.status).to.equal(400);
    expect(resposta.body.error.code).to.equal('VALIDATION_ERROR');
    expect(resposta.body.error.message).to.equal('Dados da requisição inválidos.');
  });

  it('Deve impedir cadastro com senha inválida', async () => {
    const resposta = await request('http://localhost:3333')
      .post('/api/auth/register')
      .send({
        name: 'Ana Silva',
        email: `senha.${Date.now()}@example.com`,
        password: '123',
      });
    expect(resposta.status).to.equal(400);
    expect(resposta.body.error.code).to.equal('VALIDATION_ERROR');
    expect(resposta.body.error.message).to.equal('Dados da requisição inválidos.');
  });
});
