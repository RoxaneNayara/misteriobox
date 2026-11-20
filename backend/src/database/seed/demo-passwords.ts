import { randomBytes } from 'node:crypto';
import { readOptionalString } from '../../config/env';
import { passwordField } from '../../validators/auth.validator';

interface DemoPasswordSource {
  email: string;
  passwordEnvVar: string;
}

/** Senha temporária que respeita a política de senha (letras e números). */
function generateTemporaryPassword(): string {
  return `Demo-${randomBytes(6).toString('hex')}7`;
}

/**
 * Obtém a senha de um usuário demonstrativo a partir do ambiente.
 * - Variável definida e válida: usa o valor (configuração reproduzível).
 * - Variável definida e inválida: interrompe a inicialização com mensagem clara.
 * - Variável ausente: gera uma senha temporária e a exibe apenas no console local.
 */
export function resolveDemoPassword({ email, passwordEnvVar }: DemoPasswordSource): string {
  const configuredPassword = readOptionalString(passwordEnvVar);
  if (configuredPassword) {
    const validation = passwordField.safeParse(configuredPassword);
    if (!validation.success) {
      throw new Error(
        `${passwordEnvVar} inválida: ${validation.error.issues[0]?.message ?? 'senha fora da política.'}`,
      );
    }
    return configuredPassword;
  }
  const temporaryPassword = generateTemporaryPassword();
  console.warn(
    `[seed] ${passwordEnvVar} não definida. Senha temporária de ${email} ` +
      `(válida até a API reiniciar): ${temporaryPassword}`,
  );
  return temporaryPassword;
}
