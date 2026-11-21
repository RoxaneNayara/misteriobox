/**
 * Validações do cadastro espelhando as regras do backend
 * (`backend/src/validators/auth.validator.ts`). O backend continua sendo a
 * fonte da verdade; estas funções só antecipam o retorno ao jogador.
 */

/** Letras Unicode com espaços, hífens ou apóstrofos entre as partes do nome. */
export const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:[ '’-]+\p{L}[\p{L}\p{M}]*)*$/u;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_MAX_BYTES = 72;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** Valida o nome já sem espaços externos; retorna a mensagem de erro ou `undefined`. */
export function validateName(rawName: string): string | undefined {
  const name = rawName.trim();
  if (name.length < NAME_MIN_LENGTH) {
    return `O nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres.`;
  }
  if (name.length > NAME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use apenas letras (com ou sem acento), espaços, hífens ou apóstrofos, começando e terminando com letra.';
  }
  return undefined;
}

/** Valida a senha sem alterá-la (sem trim); retorna a mensagem de erro ou `undefined`. */
export function validatePassword(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (utf8ByteLength(password) > PASSWORD_MAX_BYTES) {
    return `A senha deve ter no máximo ${PASSWORD_MAX_BYTES} bytes. Letras acentuadas e símbolos ocupam mais de um byte.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'A senha deve conter letras e números.';
  }
  return undefined;
}
