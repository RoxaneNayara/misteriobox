import { readOptionalString } from '../../config/env';
import { passwordField } from '../../validators/auth.validator';

interface DemoPasswordSource {
  email: string;
  passwordEnvVar: string;
}

/**
 * Obtém a senha de um usuário demonstrativo a partir do ambiente (somente uso local).
 * - Variável definida e válida: usa o valor (configuração reproduzível).
 * - Variável definida e inválida: interrompe a inicialização com mensagem clara.
 * - Variável ausente: o usuário não é criado. Nenhuma senha é gerada nem exibida em logs,
 *   terminais ou capturas de tela; o aviso cita apenas o nome da variável.
 */
export function resolveDemoPassword({ email, passwordEnvVar }: DemoPasswordSource): string | null {
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
  console.warn(
    `[seed] ${passwordEnvVar} não definida: usuário demonstrativo ${email} não criado. ` +
      'Defina a senha em backend/.env para usá-lo.',
  );
  return null;
}
