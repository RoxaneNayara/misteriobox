import { z } from 'zod';

/**
 * Texto obrigatório com mensagem própria para campo ausente. Para outros tipos inválidos
 * (número, objeto, operador do MongoDB), mantém a mensagem padrão do Zod.
 */
export function requiredString(missingMessage: string) {
  return z.string({
    error: (issue) => (issue.input === undefined ? missingMessage : undefined),
  });
}
