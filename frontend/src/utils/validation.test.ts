import { describe, expect, it } from 'vitest';
import { initialOf } from './labels';
import { validateName, validatePassword } from './validation';

// Mesmos cenários de `backend/tests/unit/auth.validator.test.ts`, para manter
// o frontend consistente com a validação do backend.
describe('validateName — política do campo Nome (B01)', () => {
  it.each([
    'Ana',
    'José da Silva',
    'Conceição Gonçalves',
    'Àáâãä Çèéêë',
    'Ana-Maria',
    "D'Ávila",
    'O’Neil',
    'Zoë Müller',
    '李小龍',
    'José',
    'Ana  Clara',
    'Flavio' + 'F'.repeat(70),
    '   Ana Souza   ',
  ])('aceita "%s"', (name) => {
    expect(validateName(name)).toBeUndefined();
  });

  it.each([
    '1a*, ?, /, ,)',
    'Ana*',
    'Ana?',
    'Ana/Maria',
    'Silva, Ana',
    'Ana2',
    '<script>alert(1)</script>',
    'Ana\tMaria',
    'Ana\u0000Maria',
    'Ana​Maria',
    'Ana 🕵️',
    '-Ana',
    "Ana'",
  ])('rejeita "%s" com mensagem amigável', (name) => {
    expect(validateName(name)).toMatch(/apenas letras/);
  });

  it('preserva os limites de 2 e 80 caracteres', () => {
    expect(validateName('Lu')).toBeUndefined();
    expect(validateName('L')).toMatch(/pelo menos 2/);
    expect(validateName('A'.repeat(80))).toBeUndefined();
    expect(validateName('A'.repeat(81))).toMatch(/no máximo 80/);
  });
});

describe('validatePassword — caracteres e bytes', () => {
  it('aceita 8 e 72 caracteres ASCII; rejeita 7 e 73', () => {
    expect(validatePassword('Senha123')).toBeUndefined();
    expect(validatePassword('Senha12')).toMatch(/pelo menos 8/);
    expect(validatePassword('a1' + 'b'.repeat(70))).toBeUndefined();
    expect(validatePassword('a1' + 'b'.repeat(71))).toMatch(/72 caracteres/);
  });

  it('aceita 72 bytes e rejeita acima de 72 bytes mesmo com poucos caracteres', () => {
    expect(validatePassword('a1' + 'ç'.repeat(35))).toBeUndefined();
    expect(validatePassword('a1' + 'ç'.repeat(36))).toMatch(/72 bytes/);
  });

  it('não ignora espaços da senha', () => {
    expect(validatePassword('  Senha1  ')).toBeUndefined();
  });
});

describe('initialOf — inicial do nome', () => {
  it('usa a primeira letra, inclusive fora do plano básico', () => {
    expect(initialOf('  ana souza')).toBe('A');
    expect(initialOf('élise')).toBe('É');
    expect(initialOf('𠀋𠀋')).toBe('𠀋');
  });
});
