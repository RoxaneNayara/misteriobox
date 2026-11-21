import { z } from 'zod';
import { BCRYPT_MAX_PASSWORD_BYTES, passwordByteLength } from '../services/password.service';

/**
 * Política do campo Nome (B01):
 * - letras Unicode (inclusive acentuadas e marcas combinantes);
 * - espaços internos, hífens e apóstrofos (' ou ’) entre as partes do nome;
 * - começa e termina com letra.
 * Números, símbolos (*, ?, /, vírgula...), emojis e caracteres de controle ou
 * invisíveis são recusados. As classes de separador e de letra são disjuntas,
 * o que mantém a verificação linear (sem retrocesso excessivo).
 */
export const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:[ '’-]+\p{L}[\p{L}\p{M}]*)*$/u;

export const NAME_POLICY_MESSAGE =
  'O nome deve conter apenas letras (com ou sem acento), espaços, hífens ou apóstrofos, ' +
  'começando e terminando com letra.';

export const PASSWORD_BYTES_MESSAGE =
  `A senha deve ter no máximo ${BCRYPT_MAX_PASSWORD_BYTES} bytes. ` +
  'Letras acentuadas e símbolos ocupam mais de um byte.';

const emailField = z
  .string({ required_error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(120, 'O e-mail deve ter no máximo 120 caracteres.')
  .email('Informe um e-mail válido.');

/** Espaços externos são removidos (comportamento esperado, B03); os limites não mudam. */
export const nameField = z
  .string({ required_error: 'Informe o nome.' })
  .trim()
  .min(2, 'O nome deve ter pelo menos 2 caracteres.')
  .max(80, 'O nome deve ter no máximo 80 caracteres.')
  .regex(NAME_PATTERN, NAME_POLICY_MESSAGE);

/**
 * Política de senha do cadastro (também aplicada às senhas demonstrativas).
 * A senha nunca é alterada (sem trim). Além do limite de 72 caracteres, o
 * limite de 72 bytes impede o truncamento silencioso do bcrypt.
 */
export const passwordField = z
  .string({ required_error: 'Informe a senha.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')
  .regex(/\d/, 'A senha deve conter pelo menos um número.')
  .refine(
    (password) => passwordByteLength(password) <= BCRYPT_MAX_PASSWORD_BYTES,
    PASSWORD_BYTES_MESSAGE,
  );

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailField,
    password: z.string({ required_error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
  })
  .strict();
