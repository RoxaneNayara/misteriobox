import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * O bcrypt considera somente os primeiros 72 bytes da senha (UTF-8) e ignora o
 * restante em silêncio. Letras acentuadas e símbolos ocupam mais de um byte,
 * então o limite precisa ser verificado em bytes, não em caracteres.
 */
export const BCRYPT_MAX_PASSWORD_BYTES = 72;

export function passwordByteLength(plainPassword: string): number {
  return Buffer.byteLength(plainPassword, 'utf8');
}

function exceedsBcryptLimit(plainPassword: string): boolean {
  return passwordByteLength(plainPassword) > BCRYPT_MAX_PASSWORD_BYTES;
}

export const passwordService = {
  /** Gera o hash; senhas acima do limite do bcrypt nunca são truncadas. */
  hash(plainPassword: string): Promise<string> {
    if (exceedsBcryptLimit(plainPassword)) {
      return Promise.reject(
        new Error(
          `A senha excede ${BCRYPT_MAX_PASSWORD_BYTES} bytes e seria truncada pelo bcrypt.`,
        ),
      );
    }
    return bcrypt.hash(plainPassword, env.bcryptSaltRounds);
  },

  /**
   * Compara a senha com o hash. Senhas acima de 72 bytes são recusadas antes da
   * comparação: caso contrário, qualquer sufixo após o 72º byte seria ignorado
   * e uma senha diferente da cadastrada poderia ser aceita.
   */
  async matches(plainPassword: string, passwordHash: string): Promise<boolean> {
    if (exceedsBcryptLimit(plainPassword)) {
      return false;
    }
    return bcrypt.compare(plainPassword, passwordHash);
  },
};
