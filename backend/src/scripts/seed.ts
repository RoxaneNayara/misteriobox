import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../database/connection';
import { seedDatabase } from '../database/seed';

/**
 * Carga do catálogo em um banco persistente (ex.: MongoDB Atlas), executada manualmente:
 *   MONGODB_URI="..." npm run seed -w backend
 * Idempotente: insere as missões que faltam e atualiza as existentes, sem apagar nada.
 * Nunca cria usuários demonstrativos.
 */
async function main(): Promise<void> {
  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error('Defina MONGODB_URI para carregar o catálogo em um banco persistente.');
  }
  await connectDatabase();
  await seedDatabase({ demoUsers: false });
}

main()
  .catch((error: unknown) => {
    console.error('[seed] Falha:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
