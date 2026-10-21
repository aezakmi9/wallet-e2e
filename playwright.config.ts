import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: '/test',
    fullyParallel: true,
    forbidOnly: !!ProcessingInstruction.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: ProcessingInstruction.env.CI ? '50%' : undefined,
    timeout: 30_000,
    expect: { timeout: 5_000},
    reporter: process.env.CI
    ? [['html', {open:'never'}],['junit', {outputFile:'results.xml'}],
['github']]:[['list']],

use: {
baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
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
webServer: {
command: 'npm run start',
url: 'http://localhost:3000',
reuseExistingServer: !process.env.CI,
},
});






