import { describe, expect, it } from 'vitest';
import { DatabaseSetupError, describeDatabaseError } from '../../src/errors/database-errors';

/** Erro no formato do driver do MongoDB, com mensagem que poderia conter dados sensíveis. */
function mongoError(fields: Record<string, unknown>): Error {
  return Object.assign(
    new Error('falha em mongodb+srv://usuario:SenhaSecreta123@cluster.exemplo.net/misteriobox'),
    fields,
  );
}

describe('Diagnóstico seguro de falhas do banco', () => {
  it('autenticação recusada pelo Atlas (8000) na conexão', () => {
    const error = new DatabaseSetupError(
      'conexao',
      mongoError({ name: 'MongoServerError', code: 8000, codeName: 'AtlasError' }),
    );
    expect(describeDatabaseError(error)).toEqual({
      phase: 'conexao',
      name: 'MongoServerError',
      code: 8000,
      codeName: 'AtlasError',
      category: 'autenticacao',
    });
  });

  it('permissão insuficiente (13) na criação dos índices', () => {
    const error = new DatabaseSetupError(
      'indices',
      mongoError({ name: 'MongoServerError', code: 13, codeName: 'Unauthorized' }),
    );
    expect(describeDatabaseError(error)).toMatchObject({ phase: 'indices', category: 'permissao' });
  });

  it('falha de rede e URI inválida sem código numérico', () => {
    expect(
      describeDatabaseError(
        new DatabaseSetupError('conexao', mongoError({ name: 'MongoServerSelectionError' })),
      ),
    ).toEqual({ phase: 'conexao', name: 'MongoServerSelectionError', category: 'rede' });
    expect(
      describeDatabaseError(
        new DatabaseSetupError('conexao', mongoError({ name: 'MongoParseError' })),
      ).category,
    ).toBe('uri-invalida');
  });

  it('nunca inclui a mensagem, a URI, o usuário ou a senha', () => {
    const error = new DatabaseSetupError(
      'carga-inicial',
      mongoError({ name: 'MongoServerError', code: 11000, codeName: 'DuplicateKey' }),
    );
    const logged = JSON.stringify(describeDatabaseError(error));
    expect(logged).not.toMatch(/SenhaSecreta123|usuario|mongodb\+srv|cluster\.exemplo/);
    expect(Object.keys(describeDatabaseError(error))).not.toContain('message');
  });

  it('descarta campos fora do formato esperado e valores que não são erros', () => {
    const forged = mongoError({
      name: 'Erro com senha=SenhaSecreta123',
      code: 'mongodb+srv://usuario:SenhaSecreta123@x',
      codeName: 'senha: SenhaSecreta123',
    });
    expect(describeDatabaseError(forged)).toEqual({
      phase: 'desconhecida',
      name: 'Error',
      category: 'outra',
    });
    expect(describeDatabaseError('mongodb+srv://usuario:SenhaSecreta123@x')).toEqual({
      phase: 'desconhecida',
      name: 'Error',
      category: 'outra',
    });
  });
});
