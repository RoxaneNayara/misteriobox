import { describe, expect, it } from 'vitest';
import { DEMO_MISSIONS } from '../../src/database/seed/missions';
import published from './fixtures/catalogo-publicado.json';

/**
 * Contrato do catálogo publicado. A carga do catálogo atualiza o conteúdo das missões já
 * gravadas no banco (mesmo `missionId`, mesmo `_id`), inclusive as que têm investigações em
 * andamento. Por isso, nas missões publicadas, os identificadores de suspeitos, evidências,
 * pré-requisitos, dicas e da solução não podem mudar: o progresso salvo (evidências analisadas,
 * dicas usadas) e a pontuação dependem deles.
 *
 * Correções de texto são permitidas. Mudanças estruturais exigem uma nova missão (novo
 * `missionId`) ou uma decisão consciente, atualizando este arquivo de referência e avaliando
 * as investigações em andamento (ver docs/implantacao.md, "Atualização do catálogo").
 */
type PublishedMission = {
  suspects: string[];
  evidences: Record<string, string[]>;
  hints: string[];
  culprit: string;
  decisiveEvidence: string;
};
const reference = published as Record<string, PublishedMission>;

describe('Catálogo publicado — identificadores estáveis', () => {
  it('nenhuma missão publicada foi removida nem renomeada', () => {
    const current = DEMO_MISSIONS.map((mission) => mission.missionId);
    for (const missionId of Object.keys(reference)) expect(current).toContain(missionId);
  });

  describe.each(Object.entries(reference))('%s', (missionId, expected) => {
    const mission = DEMO_MISSIONS.find((candidate) => candidate.missionId === missionId)!;

    it('mantém suspeitos, evidências, pré-requisitos e dicas', () => {
      expect(mission.suspects.map((suspect) => suspect.suspectId)).toEqual(expected.suspects);
      expect(Object.fromEntries(mission.evidences.map((e) => [e.evidenceId, e.requires]))).toEqual(
        expected.evidences,
      );
      expect(mission.hints.map((hint) => hint.hintId)).toEqual(expected.hints);
    });

    it('mantém o culpado e a evidência decisiva', () => {
      expect(mission.solution.culpritSuspectId).toBe(expected.culprit);
      expect(mission.solution.decisiveEvidenceId).toBe(expected.decisiveEvidence);
    });
  });
});
