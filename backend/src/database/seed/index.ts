import { env } from '../../config/env';
import { isDuplicateKeyError } from '../../errors/database-errors';
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
  let result: { inserted: number; updated: number };
  try {
    result = await missionRepository.upsertMany(DEMO_MISSIONS);
  } catch (error) {
    // Duas instâncias da Vercel podem carregar o catálogo ao mesmo tempo: se ambas tentarem
    // inserir a mesma missão, o índice único recusa uma delas. A segunda tentativa encontra a
    // missão já criada e apenas a atualiza.
    if (!isDuplicateKeyError(error)) throw error;
    result = await missionRepository.upsertMany(DEMO_MISSIONS);
  }
  const { inserted, updated } = result;
  console.log(
    `[seed] Catálogo com ${DEMO_MISSIONS.length} missões (novas: ${inserted}, atualizadas: ${updated}).`,
  );
}

/** Usuários demonstrativos: somente fora de produção; cria apenas os que ainda não existem. */
async function seedDemoUsers(): Promise<void> {
  let created = 0;
  for (const demoUser of DEMO_USERS) {
    if (await userRepository.existsByEmail(demoUser.email)) continue;
    const password = resolveDemoPassword(demoUser);
    if (password === null) continue;
    await userRepository.create({
      name: demoUser.name,
      email: demoUser.email,
      passwordHash: await passwordService.hash(password),
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
