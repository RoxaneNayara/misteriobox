import type { Mission } from '../../../models/mission.model';
import { missionUltimoAplauso } from './mission-001-ultimo-aplauso';
import { missionQuarto307 } from './mission-002-quarto-307';
import { missionCartaDeNovembro } from './mission-003-carta-de-novembro';

export const DEMO_MISSIONS: Mission[] = [
  missionUltimoAplauso,
  missionQuarto307,
  missionCartaDeNovembro,
];
