import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Valores exclusivos dos testes, definidos antes de importar `src/config/env.ts`.
    env: {
      JWT_SECRET: 'segredo-exclusivo-dos-testes-automatizados',
      BCRYPT_SALT_ROUNDS: '4',
      DEMO_USER_SOFIA_PASSWORD: 'SenhaDeTeste1',
      DEMO_USER_BRUNO_PASSWORD: 'SenhaDeTeste2',
      DEMO_USER_LIVIA_PASSWORD: 'SenhaDeTeste3',
    },
    // O MongoDB em memória pode precisar baixar o binário na primeira execução.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
