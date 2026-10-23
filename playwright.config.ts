import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const apiURL = process.env.API_URL ?? 'http://localhost:8080';

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
            name: 'api',
            testMatch: /api\/.*\.spec\.ts/,
            use: { baseURL: apiURL },
            // Each worker registers its own users, and the API allows 20 auth requests per IP per minute
            workers: 4,
        },
        {
            name: 'chromium',
            testIgnore: /api\//,
            use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
            dependencies: ['setup'],
            // Every page load is an auth request, and the API allows 20 per IP per minute
            workers: 1,
        },
        {
            name: 'mobile-safari',
            testIgnore: /api\//,
            use: { ...devices['iPhone 14'], storageState: '.auth/user.json' },
            dependencies: ['setup'],
            workers: 1,
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
