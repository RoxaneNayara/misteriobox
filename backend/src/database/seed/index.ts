import { env } from '../../config/env';
import { missionRepository } from '../../repositories/mission.repository';
import { userRepository } from '../../repositories/user.repository';
import { passwordService } from '../../services/password.service';
import { resolveDemoPassword } from './demo-passwords';
import { DEMO_USERS } from './demo-users';
import { assertCatalogIntegrity } from './mission-integrity';
import { DEMO_MISSIONS } from './missions';

/**
 * Catálogo: validado e gravado a cada inicialização, de forma idempotente
 * (insere o que falta e atualiza o conteúdo das missões existentes, sem duplicar,
 * recriar ou apagar registros e sem tocar nas investigações dos jogadores).
 */
async function seedMissions(): Promise<void> {
  assertCatalogIntegrity(DEMO_MISSIONS);
  const { inserted, updated } = await missionRepository.upsertMany(DEMO_MISSIONS);
  console.log(
    `[seed] Catálogo com ${DEMO_MISSIONS.length} missões (novas: ${inserted}, atualizadas: ${updated}).`,
  );
}

/** Usuários demonstrativos: somente fora de produção; cria apenas os que ainda não existem. */
async function seedDemoUsers(): Promise<void> {
  let created = 0;
  for (const demoUser of DEMO_USERS) {
    if (await userRepository.existsByEmail(demoUser.email)) continue;
    await userRepository.create({
      name: demoUser.name,
      email: demoUser.email,
      passwordHash: await passwordService.hash(resolveDemoPassword(demoUser)),
    });
    created += 1;
  }
  if (created > 0) console.log(`[seed] ${created} usuário(s) demonstrativo(s) criado(s).`);
}

export interface SeedOptions {
  /** Padrão: SEED_DEMO_USERS (sempre falso em ambiente publicado). */
  demoUsers?: boolean;
}

export async function seedDatabase({
  demoUsers = env.seedDemoUsers,
}: SeedOptions = {}): Promise<void> {
  await seedMissions();
  if (demoUsers) {
    await seedDemoUsers();
  }
}
