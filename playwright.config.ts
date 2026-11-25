import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta (navegador real) da MistérioBox.
 * Pré-requisito: `npm run build` (usa o build da API e o `vite preview`).
 * A API sobe na porta 3400 e o site na 4173, sem conflitar com `npm run dev`.
 */
const API_PORT = 3400;
const WEB_PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node backend/dist/server.js',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PORT: String(API_PORT),
        JWT_SECRET: 'segredo-exclusivo-dos-testes-e2e',
        BCRYPT_SALT_ROUNDS: '4',
        CORS_ORIGIN: `http://localhost:${WEB_PORT}`,
        DEMO_USER_SOFIA_PASSWORD: 'SenhaE2e1',
        DEMO_USER_BRUNO_PASSWORD: 'SenhaE2e2',
        DEMO_USER_LIVIA_PASSWORD: 'SenhaE2e3',
      },
    },
    {
      command: 'npm run preview -w frontend',
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_API_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
