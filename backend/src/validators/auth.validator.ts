import { z } from 'zod';

const emailField = z
  .string({ required_error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(120, 'O e-mail deve ter no máximo 120 caracteres.')
  .email('Informe um e-mail válido.');

/** Política de senha do cadastro (também aplicada às senhas demonstrativas). */
export const passwordField = z
  .string({ required_error: 'Informe a senha.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')
  .regex(/\d/, 'A senha deve conter pelo menos um número.');

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Informe o nome.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .max(80, 'O nome deve ter no máximo 80 caracteres.'),
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
