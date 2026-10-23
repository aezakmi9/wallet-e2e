import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import type { AccountDto } from '@api/types';
import { AuthPage } from '@pages/AuthPage';
import { AccountPage } from '@pages/AccountPage';
import { WalletUser } from '@utils/WalletUser';

// Where the frontend keeps its refresh token (wallet-frontend/src/api/client.ts)
const REFRESH_TOKEN_KEY = 'wallet.refreshToken';

type Pages = {
    authPage: AuthPage;
    account: AccountDto;
    accountPage: AccountPage;
};

type Workers = {
    apiRequest: APIRequestContext;
    owner: WalletUser;
    recipient: WalletUser;
};

// Every page load spends the stored refresh token (POST /api/auth/refresh) and gets a new one,
// and spending an old token again revokes all of the user's sessions. So a saved storage state
// can't be shared between tests: each worker registers its own `owner`, and the token the page
// ends a test with is handed to the next test. /api/auth/** is also rate limited (20 per IP per
// minute), which is why users are per worker and the UI projects run few workers.
export const test = base.extend<Pages, Workers>({
    apiRequest: [
        async ({ playwright }, use) => {
            const context = await playwright.request.newContext({
                baseURL: process.env.API_URL ?? 'http://localhost:8080',
            });
            await use(context);
            await context.dispose();
        },
        { scope: 'worker' },
    ],

    owner: [
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

    authPage: async ({ page }, use) => {
        await use(new AuthPage(page));
    },

    // The owner's USD account, shared by the tests in a worker: compare balances with what was there before.
    account: async ({ owner }, use) => {
        await use(await owner.account());
    },

    // An AccountPage logged in as `owner`; call goto() to open an account.
    accountPage: async ({ page, owner }, use) => {
        // Seeds the token on the first load only, so a reload keeps the rotated one.
        // This also replaces whatever token the project's storage state brought along.
        await page.addInitScript(
            ([key, token]) => {
                if (sessionStorage.getItem('e2e.seeded')) return;
                localStorage.setItem(key, token);
                sessionStorage.setItem('e2e.seeded', '1');
            },
            [REFRESH_TOKEN_KEY, owner.refreshToken] as const
        );

        await use(new AccountPage(page));

        const latest = await page
            .evaluate((key) => localStorage.getItem(key), REFRESH_TOKEN_KEY)
            .catch(() => null);
        if (latest) {
            owner.refreshToken = latest;
        } else {
            await owner.login();
        }
    },
});

export { expect };
