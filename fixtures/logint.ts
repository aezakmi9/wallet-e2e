import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import type { AccountDto } from '@api/types';
import { AuthPage } from '@pages/AuthPage';
import { AccountPage } from '@pages/AccountPage';
import { MerchantHoldsPage } from '@pages/MerchantHoldsPage';
import { WalletUser } from '@utils/WalletUser';

// Where the frontend keeps its refresh token (wallet-frontend/src/api/client.ts)
const REFRESH_TOKEN_KEY = 'wallet.refreshToken';

type Pages = {
    authPage: AuthPage;
    account: AccountDto;
    accountPage: AccountPage;
    merchantHoldsPage: MerchantHoldsPage;
};

type Workers = {
    apiRequest: APIRequestContext;
    owner: WalletUser;
    recipient: WalletUser;
    admin: WalletUser;
    merchant: WalletUser;
};

// Every page load spends the stored refresh token (POST /api/auth/refresh) and gets a new one,
// and spending an old token again revokes all of the user's sessions. So a saved storage state
// can't be shared between tests: each worker registers its own `owner`, and the token the page
// ends a test with is handed to the next test. /api/auth/** is also rate limited (20 per IP per
// minute), which is why users are per worker and the UI projects run few workers.
async function loggedInAs(page: Page, user: WalletUser, use: () => Promise<void>) {
    // Seeds the token on the first load only, so a reload keeps the rotated one.
    // This also replaces whatever token the project's storage state brought along.
    await page.addInitScript(
        ([key, token]) => {
            if (sessionStorage.getItem('e2e.seeded')) return;
            localStorage.setItem(key, token);
            sessionStorage.setItem('e2e.seeded', '1');
        },
        [REFRESH_TOKEN_KEY, user.refreshToken] as const
    );

    await use();

    const latest = await page
        .evaluate((key) => localStorage.getItem(key), REFRESH_TOKEN_KEY)
        .catch(() => null);
    if (latest) {
        user.refreshToken = latest;
    } else {
        await user.login();
    }
}

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

    admin: [
        async ({ apiRequest }, use) => {
            await use(
                await WalletUser.login(apiRequest, process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!)
            );
        },
        { scope: 'worker' },
    ],

    // The role is read from the database on every token refresh, so the page picks it up on load
    merchant: [
        async ({ apiRequest, admin }, use) => {
            const merchant = await WalletUser.register(apiRequest);
            const response = await admin.changeRole(merchant.id, { role: 'MERCHANT' });
            expect(response.status(), await response.text()).toBe(200);
            await use(merchant);
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
        await loggedInAs(page, owner, () => use(new AccountPage(page)));
    },

    // A MerchantHoldsPage logged in as `merchant`; call goto() to open it.
    merchantHoldsPage: async ({ page, merchant }, use) => {
        await loggedInAs(page, merchant, () => use(new MerchantHoldsPage(page)));
    },
});

export { expect };
