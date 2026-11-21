import { describe, expect, it } from 'vitest';
import { BCRYPT_MAX_PASSWORD_BYTES, passwordService } from '../../src/services/password.service';

describe('passwordService — limite de 72 bytes do bcrypt', () => {
  const password72Bytes = 'a1' + 'ç'.repeat(35);

  it('confere a senha correta e recusa uma diferente', async () => {
    const hash = await passwordService.hash('Detetive2026');
    expect(await passwordService.matches('Detetive2026', hash)).toBe(true);
    expect(await passwordService.matches('Detetive2027', hash)).toBe(false);
  });

  it('recusa no login uma senha que só difere após o 72º byte', async () => {
    const hash = await passwordService.hash(password72Bytes);
    expect(await passwordService.matches(password72Bytes, hash)).toBe(true);
    expect(await passwordService.matches(password72Bytes + 'sufixo', hash)).toBe(false);
  });

  it('não gera hash de senha acima do limite (sem truncamento silencioso)', async () => {
    await expect(passwordService.hash('a'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1))).rejects.toThrow(
      /72 bytes/,
    );
  });
});
