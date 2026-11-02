import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { BankSim } from '@utils/BankSim';
import { WalletUser } from '@utils/WalletUser';

type WorkerFixtures = {
    apiRequest: APIRequestContext;
    user: WalletUser;
    recipient: WalletUser;
    admin: WalletUser;
    bankSim: BankSim;
    merchant: WalletUser;
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

    bankSim:[
        async ({playwright}, use) => {
        const context = await playwright.request.newContext({
            baseURL: process.env.BANK_SIM_URL ?? 'http://localhost:8081',
        });
        await use(new BankSim(context));
        await context.dispose();
        },
        {scope:'worker'}
    ],

    merchant: [
        async({apiRequest, admin},use)=>{
            const merchant = await WalletUser.register(apiRequest);
            const response = await admin.changeRoleAssign(merchant.id, 'MERCHANT');
            expect(response.status(), await response.text()).toBe(200);

            await merchant.login();
            await use(merchant);
        },
        {scope: 'worker'}
    ]
});

export { expect };
