const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/gestaodeusuarios/ui',

  timeout: 30000,

  fullyParallel: false,

  workers: 1,

  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev -w backend',
      url: 'http://localhost:3333/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        JWT_SECRET: 'segredo-local-exclusivo-dos-testes-qa',
        BCRYPT_SALT_ROUNDS: '4',
        DEMO_USER_SOFIA_PASSWORD: 'SenhaDemoQa01',
        DEMO_USER_BRUNO_PASSWORD: 'SenhaDemoQa02',
        DEMO_USER_LIVIA_PASSWORD: 'SenhaDemoQa03',
      },
    },
    {
      command: 'npm run dev -w frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
