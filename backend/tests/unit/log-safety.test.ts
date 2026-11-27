import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Logs sem credenciais nem dados pessoais:
 * - usuários demonstrativos sem senha configurada não são criados e nenhuma senha é exibida;
 * - em ambiente publicado, erros inesperados são registrados só com tipo e código.
 */
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

function loggedText(spy: { mock: { calls: unknown[][] } }): string {
  return spy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
}

describe('Senhas dos usuários demonstrativos', () => {
  it('variável ausente: não gera nem exibe senha; o aviso cita só a variável', async () => {
    vi.stubEnv('DEMO_USER_SOFIA_PASSWORD', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { resolveDemoPassword } = await import('../../src/database/seed/demo-passwords');

    const password = resolveDemoPassword({
      email: 'sofia@example.com',
      passwordEnvVar: 'DEMO_USER_SOFIA_PASSWORD',
    });

    expect(password).toBeNull();
    const output = loggedText(warn) + loggedText(log);
    expect(output).toContain('DEMO_USER_SOFIA_PASSWORD');
    expect(output).not.toMatch(/senha tempor[aá]ria|Demo-[0-9a-f]+/i);
  });

  it('variável definida e válida: usa o valor sem exibi-lo', async () => {
    vi.stubEnv('DEMO_USER_SOFIA_PASSWORD', 'SenhaLocal2026');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { resolveDemoPassword } = await import('../../src/database/seed/demo-passwords');
    expect(
      resolveDemoPassword({
        email: 'sofia@example.com',
        passwordEnvVar: 'DEMO_USER_SOFIA_PASSWORD',
      }),
    ).toBe('SenhaLocal2026');
    expect(loggedText(warn)).not.toContain('SenhaLocal2026');
  });

  it('variável fora da política: interrompe sem mostrar o valor', async () => {
    vi.stubEnv('DEMO_USER_SOFIA_PASSWORD', 'curta');
    const { resolveDemoPassword } = await import('../../src/database/seed/demo-passwords');
    expect(() =>
      resolveDemoPassword({
        email: 'sofia@example.com',
        passwordEnvVar: 'DEMO_USER_SOFIA_PASSWORD',
      }),
    ).toThrow(/DEMO_USER_SOFIA_PASSWORD inválida/);
    try {
      resolveDemoPassword({
        email: 'sofia@example.com',
        passwordEnvVar: 'DEMO_USER_SOFIA_PASSWORD',
      });
    } catch (error) {
      expect(String(error)).not.toContain('curta');
    }
  });
});

describe('Tratamento de erros inesperados', () => {
  function fakeResponse() {
    const response = { status: vi.fn(), json: vi.fn() };
    response.status.mockReturnValue(response);
    return response as unknown as Response & {
      status: typeof response.status;
      json: typeof response.json;
    };
  }

  const leakingError = Object.assign(
    new Error('E11000-like failure for jogadora.real@example.com at mongodb+srv://u:senha@host'),
    { name: 'MongoServerError', code: 121, codeName: 'DocumentValidationFailure' },
  );

  it('publicado: registra só tipo e código, e responde 500 genérico', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv(
      'MONGODB_URI',
      'mongodb+srv://usuario-exemplo:senha-exemplo@cluster-exemplo.mongodb.net',
    );
    vi.stubEnv('JWT_SECRET', 'segredo-de-teste-com-mais-de-32-caracteres');
    vi.stubEnv('SEED_DEMO_USERS', '');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { errorHandler } = await import('../../src/middlewares/error-handler');
    const response = fakeResponse();

    errorHandler(leakingError, {} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' },
    });
    const output = loggedText(error);
    expect(output).toContain('"code":121');
    expect(output).not.toMatch(/jogadora\.real|mongodb\+srv|senha/);
  });

  it('local: mantém o erro completo para depuração', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { errorHandler } = await import('../../src/middlewares/error-handler');
    errorHandler(leakingError, {} as Request, fakeResponse(), vi.fn());
    expect(error).toHaveBeenCalledWith('[error]', leakingError);
  });
});
