const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/gestaodeusuarios/ui',

    timeout: 30000,

    fullyParallel: false,

    workers: 1,

    reporter: 'list',

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'retain-on-faiure',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
    ],
});
