import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { WalletUser } from '@utils/WalletUser';

type WorkerFixtures = {
    apiRequest: APIRequestContext;
    user: WalletUser;
    recipient: WalletUser;
    admin: WalletUser;
};

// /api/auth/** is rate limited per IP, so users are registered once per worker and
// shared by every test it runs. Their accounts (one per currency) are shared too, so
// tests must assert on balance changes, not absolute balances. A worker runs one test
// at a time, so those changes don't interleave.
export const test = base.extend<{}, WorkerFixtures>({
    apiRequest: [
        async ({ playwright }, use, workerInfo) => {
            const context = await playwright.request.newContext({
                baseURL: workerInfo.project.use.baseURL,
            });
            await use(context);
            await context.dispose();
        },
        { scope: 'worker' },
    ],

    user: [
        async ({ apiRequest }, use) => {
            await use(await WalletUser.register(apiRequest));
        },
        { scope: 'worker' },
    ],

    recipient: [
        async ({ apiRequest }, use) => {
            await use(await WalletUser.register(apiRequest));
        },
        { scope: 'worker' },
    ],

    admin: [
        async ({apiRequest}, use) => {
            await use(await WalletUser.login(apiRequest, process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!));
        },
    {scope: 'worker'}
    ],
});

export { expect };
