import request from 'supertest';
import { expect } from 'chai';

describe('US03-CT02 - Acesso a recursos protegidos', () => {
  it('Deve impedir acesso sem autenticação', async () => {
    const resposta = await request('http://localhost:3333').get('/api/auth/me');

    expect(resposta.status).to.equal(401);

    expect(resposta.body.error.code).to.equal('UNAUTHORIZED');

    expect(resposta.body.error.message).to.equal('Autenticação necessária.');
  });

  it('Deve impedir acesso com token inválido', async () => {
    const resposta = await request('http://localhost:3333')
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido');

    expect(resposta.status).to.equal(401);

    expect(resposta.body.error.code).to.equal('UNAUTHORIZED');
  });
});
