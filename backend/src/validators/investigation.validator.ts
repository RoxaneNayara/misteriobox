import { z } from 'zod';
import { requiredString } from './required-string';

const identifier = (fieldLabel: string) =>
  requiredString(`Informe ${fieldLabel}.`)
    .trim()
    .min(1, `Informe ${fieldLabel}.`)
    .max(64, `${fieldLabel} inválido.`);

export const startInvestigationSchema = z
  .object({ missionId: identifier('o identificador da missão') })
  .strict();

/**
 * Apenas suspeito e evidência são aceitos: campos extras (como pontuação
 * ou status) são rejeitados, pois o backend não confia nesses dados.
 */
export const accusationSchema = z
  .object({
    suspectId: identifier('o identificador do suspeito'),
    evidenceId: identifier('o identificador da evidência'),
  })
  .strict();

export const investigationIdParamsSchema = z.object({
  investigationId: z.string().regex(/^[a-f\d]{24}$/i, 'Identificador de investigação inválido.'),
});

export const evidenceParamsSchema = investigationIdParamsSchema.extend({
  evidenceId: identifier('o identificador da evidência'),
});
