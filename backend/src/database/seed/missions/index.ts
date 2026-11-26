import type { Mission } from '../../../models/mission.model';
import { missionUltimoAplauso } from './mission-001-ultimo-aplauso';
import { missionQuarto307 } from './mission-002-quarto-307';
import { missionCartaDeNovembro } from './mission-003-carta-de-novembro';
import { missionAssinaturaFalsa } from './mission-004-assinatura-falsa';
import { missionTrofeuTrocado } from './mission-005-trofeu-trocado';
import { missionMolduraFalsa } from './mission-006-moldura-falsa';
import { missionVotoDecisivo } from './mission-007-voto-decisivo';
import { missionProtocoloZero } from './mission-008-protocolo-zero';
import { missionTestamentoImpossivel } from './mission-009-testamento-impossivel';
import { missionArquivo17 } from './mission-010-arquivo-17';

/** Catálogo gratuito: 10 missões, sendo 3 fáceis, 3 médias e 4 difíceis. */
export const DEMO_MISSIONS: Mission[] = [
  missionUltimoAplauso,
  missionQuarto307,
  missionCartaDeNovembro,
  missionAssinaturaFalsa,
  missionTrofeuTrocado,
  missionMolduraFalsa,
  missionVotoDecisivo,
  missionProtocoloZero,
  missionTestamentoImpossivel,
  missionArquivo17,
];
