import { withSetupPhase } from '../errors/database-errors';
import { connectDatabase } from './connection';
import { seedDatabase } from './seed';

/**
 * Preparação única por instância (ambiente serverless da Vercel): conexão + carga
 * idempotente das missões. Requisições simultâneas na mesma instância compartilham a
 * mesma promessa; se a preparação falhar, a próxima requisição tenta de novo.
 */
let readiness: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  if (!readiness) {
    readiness = (async () => {
      await connectDatabase();
      await withSetupPhase('carga-inicial', () => seedDatabase());
    })().catch((error: unknown) => {
      readiness = null;
      throw error;
    });
  }
  return readiness;
}
