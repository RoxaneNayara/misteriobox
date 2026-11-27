import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../../src/validators/auth.validator';
import {
  accusationSchema,
  investigationIdParamsSchema,
  startInvestigationSchema,
} from '../../src/validators/investigation.validator';

/**
 * Mensagens e códigos de validação que a API devolve. Protegem o contrato na atualização do
 * Zod (3 → 4): campo ausente mantém a mensagem em português, tipo inválido é recusado e campos
 * extras continuam proibidos.
 */
function messages(result: {
  success: boolean;
  error?: { issues: Array<{ path: PropertyKey[]; message: string; code: string }> };
}) {
  expect(result.success).toBe(false);
  return Object.fromEntries(
    result.error!.issues.map((issue) => [issue.path.map(String).join('.'), issue.message]),
  );
}

describe('Validação — mensagens de campo ausente', () => {
  it('cadastro sem dados', () => {
    expect(messages(registerSchema.safeParse({}))).toEqual({
      name: 'Informe o nome.',
      email: 'Informe o e-mail.',
      password: 'Informe a senha.',
    });
  });

  it('login sem dados', () => {
    expect(messages(loginSchema.safeParse({}))).toEqual({
      email: 'Informe o e-mail.',
      password: 'Informe a senha.',
    });
  });

  it('início de investigação e acusação sem identificadores', () => {
    expect(messages(startInvestigationSchema.safeParse({}))).toEqual({
      missionId: 'Informe o identificador da missão.',
    });
    expect(messages(accusationSchema.safeParse({}))).toEqual({
      suspectId: 'Informe o identificador do suspeito.',
      evidenceId: 'Informe o identificador da evidência.',
    });
  });
});

describe('Validação — tipos e campos não permitidos', () => {
  it('recusa número e operador do MongoDB no lugar de texto, sem usar a mensagem de ausência', () => {
    const result = loginSchema.safeParse({ email: 123, password: { $gt: '' } });
    const found = messages(result);
    expect(found.email).toBeTruthy();
    expect(found.email).not.toBe('Informe o e-mail.');
    expect(found.password).not.toBe('Informe a senha.');
  });

  it('recusa campos extras com o código unrecognized_keys', () => {
    const result = accusationSchema.safeParse({ suspectId: 's', evidenceId: 'e', score: 100 });
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((issue) => issue.code)).toContain('unrecognized_keys');
  });

  it('normaliza o e-mail e aceita apóstrofos, como antes', () => {
    const result = registerSchema.parse({
      name: 'Maria Teste',
      email: "  Mariana''Law@Example.com ",
      password: 'Detetive2026',
    });
    expect(result.email).toBe("mariana''law@example.com");
  });

  it('valida o identificador de investigação', () => {
    expect(investigationIdParamsSchema.safeParse({ investigationId: 'abc' }).success).toBe(false);
    expect(
      investigationIdParamsSchema.safeParse({ investigationId: '6b09c1d9bb3238d63034d185' })
        .success,
    ).toBe(true);
  });
});
