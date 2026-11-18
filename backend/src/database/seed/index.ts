import { missionRepository } from '../../repositories/mission.repository';
import { userRepository } from '../../repositories/user.repository';
import { passwordService } from '../../services/password.service';
import { DEMO_USERS } from './demo-users';
import { assertMissionIntegrity } from './mission-integrity';
import { DEMO_MISSIONS } from './missions';

async function seedMissions(): Promise<void> {
  if ((await missionRepository.count()) > 0) return;
  DEMO_MISSIONS.forEach(assertMissionIntegrity);
  await missionRepository.insertMany(DEMO_MISSIONS);
  console.log(`[seed] ${DEMO_MISSIONS.length} missões carregadas.`);
}

async function seedUsers(): Promise<void> {
  if ((await userRepository.count()) > 0) return;
  for (const demoUser of DEMO_USERS) {
    await userRepository.create({
      name: demoUser.name,
      email: demoUser.email,
      passwordHash: await passwordService.hash(demoUser.password),
    });
  }
  console.log(`[seed] ${DEMO_USERS.length} usuários demonstrativos criados.`);
}

/** Carrega os dados demonstrativos no banco em memória (executado a cada inicialização). */
export async function seedDatabase(): Promise<void> {
  await seedMissions();
  await seedUsers();
}
