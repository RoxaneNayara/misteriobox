import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './database/connection';
import { seedDatabase } from './database/seed';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await seedDatabase();

  const server = createApp().listen(env.port, () => {
    console.log(`[api] MistérioBox API em http://localhost:${env.port}/api`);
    console.log(`[api] Swagger UI em http://localhost:${env.port}/api-docs`);
  });

  const shutdown = (): void => {
    console.log('[api] Encerrando...');
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('[api] Falha ao iniciar a aplicação:', error);
  process.exit(1);
});
