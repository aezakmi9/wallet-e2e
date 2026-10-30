import { test, expect } from '@fixtures/user';
import { buildDepositRequest } from '@data/builders';
import type { ApiResponse, DepositDto } from '@api/types';

const amount = -57;

test('Must create a deposit', async ({ user }) => {
    const account = await user.account();

    const response = await user.createDeposit(buildDepositRequest({ accountId: account.id, amount: 1_000 }));
    expect(response.status()).toBe(201);

    // Settled asynchronously by bank-sim, so it starts out pending
    const { payload } = (await response.json()) as ApiResponse<DepositDto>;
    expect(payload).toMatchObject({ accountId: account.id, amount: 1_000, status: 'PENDING' });
});

test(`Should reject a deposit with amount ${amount}`, async ({ user }) => {
    const account = await user.account();

    const response = await user.createDeposit(buildDepositRequest({ accountId: account.id, amount }));
    expect(response.status()).toBe(400);
});

test("Can not deposit into another user's account", async ({ user, recipient }) => {
    const other = await recipient.account();

    const response = await user.createDeposit(buildDepositRequest({ accountId: other.id, amount: 1_000 }));

    // Same 404 as a missing account, so account ids can't be probed
    expect(response.status()).toBe(404);
});
