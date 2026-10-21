import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? '50%' : undefined,
    timeout: 30_000,
    expect: { timeout: 5_000 },
    reporter: process.env.CI
        ? [['html', { open: 'never' }], ['junit', { outputFile: 'results.xml' }], ['github']]
        : [['list']],

    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        testIdAttribute: 'data-testid',
    },

    projects: [
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 14'], storageState: '.auth/user.json' },
            dependencies: ['setup'],
        },
    ],

    webServer: process.env.START_CMD
        ? {
              command: process.env.START_CMD,
              url: baseURL,
              reuseExistingServer: !process.env.CI,
          }
        : undefined,
});
