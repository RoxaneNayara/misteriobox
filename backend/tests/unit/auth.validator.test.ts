import { describe, expect, it } from 'vitest';
import {
  NAME_POLICY_MESSAGE,
  PASSWORD_BYTES_MESSAGE,
  loginSchema,
  nameField,
  passwordField,
  registerSchema,
} from '../../src/validators/auth.validator';

const VALID_PASSWORD = 'Detetive2026';

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? undefined : result.error?.issues[0]?.message;
}

describe('US01 · B01 — política do campo Nome', () => {
  it.each([
    ['nome simples', 'Ana'],
    ['nome composto', 'José da Silva'],
    ['acentos e cedilha', 'Conceição Gonçalves'],
    ['acentos variados', 'Àáâãä Çèéêë'],
    ['hífen', 'Ana-Maria'],
    ['apóstrofo reto', "D'Ávila"],
    ['apóstrofo tipográfico', 'O’Neil'],
    ['trema', 'Zoë Müller'],
    ['letras de outros alfabetos', '李小龍'],
    ['acento como marca combinante', 'Jose\u0301'],
    ['vários espaços internos', 'Ana  Clara'],
    ['nome longo sem espaços (B02 não bloqueia)', 'Flavio' + 'F'.repeat(70)],
  ])('aceita %s', (_cenario, name) => {
    expect(nameField.safeParse(name).success).toBe(true);
  });

  it.each([
    ['caracteres especiais do relatório', '1a*, ?, /, ,)'],
    ['asterisco', 'Ana*'],
    ['interrogação', 'Ana?'],
    ['barra', 'Ana/Maria'],
    ['vírgula', 'Silva, Ana'],
    ['números', 'Ana2'],
    ['marcação HTML', '<script>alert(1)</script>'],
    ['tabulação interna', 'Ana\tMaria'],
    ['quebra de linha interna', 'Ana\nMaria'],
    ['caractere nulo', 'Ana\u0000Maria'],
    ['caractere invisível (zero-width)', 'Ana​Maria'],
    ['emoji', 'Ana 🕵️'],
    ['começa com hífen', '-Ana'],
    ['termina com apóstrofo', "Ana'"],
    ['somente símbolos', "'-'"],
  ])('rejeita %s', (_cenario, name) => {
    const result = nameField.safeParse(name);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(NAME_POLICY_MESSAGE);
  });

  describe('valores-limite (preservados)', () => {
    it('aceita 2 caracteres e rejeita 1', () => {
      expect(nameField.safeParse('Lu').success).toBe(true);
      expect(firstMessage(nameField.safeParse('L'))).toBe(
        'O nome deve ter pelo menos 2 caracteres.',
      );
    });

    it('aceita 80 caracteres e rejeita 81', () => {
      expect(nameField.safeParse('A'.repeat(80)).success).toBe(true);
      expect(firstMessage(nameField.safeParse('A'.repeat(81)))).toBe(
        'O nome deve ter no máximo 80 caracteres.',
      );
    });

    it('conta o limite depois de remover os espaços externos', () => {
      expect(nameField.safeParse(`   ${'A'.repeat(80)}   `).success).toBe(true);
      expect(nameField.safeParse('   ').success).toBe(false);
    });
  });
});

describe('US01 · B03 — normalização de espaços externos (comportamento esperado)', () => {
  it('remove espaços externos do nome e do e-mail e normaliza o e-mail', () => {
    const result = registerSchema.parse({
      name: '   Ana Souza   ',
      email: '   ANA.Souza@Example.COM   ',
      password: VALID_PASSWORD,
    });
    expect(result.name).toBe('Ana Souza');
    expect(result.email).toBe('ana.souza@example.com');
  });

  it('preserva os espaços internos do nome', () => {
    expect(nameField.parse('  Maria  Clara  ')).toBe('Maria  Clara');
  });

  it('normaliza o e-mail também no login', () => {
    expect(loginSchema.parse({ email: '  Sofia@Example.com ', password: 'x' }).email).toBe(
      'sofia@example.com',
    );
  });
});

describe('E-mail — apóstrofos e limites (preservados)', () => {
  it.each(["mariansa''llaw@example.com", "o'neil@example.com", "d'avila.lima@example.com"])(
    'aceita %s',
    (email) => {
      expect(registerSchema.shape.email.safeParse(email).success).toBe(true);
    },
  );

  it('aceita 120 caracteres e rejeita 121', () => {
    const domain = '@example.com';
    const at120 = 'a'.repeat(120 - domain.length) + domain;
    expect(registerSchema.shape.email.safeParse(at120).success).toBe(true);
    expect(registerSchema.shape.email.safeParse('a' + at120).success).toBe(false);
  });
});

describe('Senha — limites de caracteres e de bytes do bcrypt', () => {
  it('nunca altera a senha (sem trim)', () => {
    expect(passwordField.parse('  Senha123  ')).toBe('  Senha123  ');
  });

  it('aceita 8 caracteres e rejeita 7', () => {
    expect(passwordField.safeParse('Senha123').success).toBe(true);
    expect(passwordField.safeParse('Senha12').success).toBe(false);
  });

  it('aceita 72 caracteres ASCII e rejeita 73', () => {
    const at72 = 'a1' + 'b'.repeat(70);
    expect(passwordField.safeParse(at72).success).toBe(true);
    expect(passwordField.safeParse(at72 + 'c').success).toBe(false);
  });

  it('aceita exatamente 72 bytes com caracteres acentuados', () => {
    const at72Bytes = 'a1' + 'ç'.repeat(35); // 37 caracteres, 72 bytes
    expect(passwordField.safeParse(at72Bytes).success).toBe(true);
  });

  it('rejeita senha com até 72 caracteres, mas acima de 72 bytes', () => {
    const over72Bytes = 'a1' + 'ç'.repeat(36); // 38 caracteres, 74 bytes
    const result = passwordField.safeParse(over72Bytes);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(PASSWORD_BYTES_MESSAGE);
  });
});
