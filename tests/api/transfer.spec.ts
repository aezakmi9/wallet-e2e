import { randomUUID } from 'node:crypto';
import { test, expect } from '@fixtures/user';
import { buildTransferRequest } from '@data/builders';
import type { ApiErrorResponse, ApiResponse, TransferDto } from '@api/types';
import { fr, tr } from '@faker-js/faker';

// Deposits and transfers both charge a 2% fee, rounded down. The transfer fee comes out of
// what the recipient gets.
const afterFee = (amount: number) => amount - Math.floor((amount * 200) / 10_000);

// Accounts are shared by the tests in a worker (see fixtures/user.ts), so balances are
// always compared with what was there before.

test('Should create a transfer', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();

    const response = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 1_000 })
    );
    expect(response.status()).toBe(201);

    const { payload } = (await response.json()) as ApiResponse<TransferDto>;
    expect(payload.status).toBe('COMPLETED');
    expect(payload.amount).toBe(1_000);
});

test('Should move money between the accounts', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();
    const fromBefore = await user.balanceOf(from);
    const toBefore = await recipient.balanceOf(to);

    const response = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 1_200 })
    );
    expect(response.status()).toBe(201);

    expect(await user.balanceOf(from)).toBe(fromBefore - 1_200);
    expect(await recipient.balanceOf(to)).toBe(toBefore + afterFee(1_200));
});

test('Should return the created transfer by id', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();

    const created = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 700 })
    );
    expect(created.status(), await created.text()).toBe(201);
    const { payload: transfer } = (await created.json()) as ApiResponse<TransferDto>;

    const response = await user.getTransfer(transfer.id);
    expect(response.status()).toBe(200);

    const { payload } = (await response.json()) as ApiResponse<TransferDto>;
    expect(payload).toMatchObject({
        id: transfer.id,
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 700,
        currency: from.currency,
        status: 'COMPLETED',
    });
});

test('Should fail a transfer with insufficient funds', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 500);
    const to = await recipient.account();
    const fromBefore = await user.balanceOf(from);
    const toBefore = await recipient.balanceOf(to);

    const response = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: fromBefore + 1 })
    );
    expect(response.status()).toBe(201);

    const { payload } = (await response.json()) as ApiResponse<TransferDto>;
    expect(payload.status).toBe('FAILED');
    expect(payload.failureReason).toBeTruthy();

    expect(await user.balanceOf(from)).toBe(fromBefore);
    expect(await recipient.balanceOf(to)).toBe(toBefore);
});

test('Should reject a transfer to the same account', async ({ user }) => {
    const account = await user.account();

    const response = await user.createTransfer(
        buildTransferRequest({ idFromAccount: account.id, idToAccount: account.id })
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as ApiErrorResponse;
    expect(body.success).toBe(false);
});

test('Should reject a transfer with a currency mismatch', async ({ user, recipient }) => {
    const from = await user.account('USD');
    await user.fund(from, 1_000);
    const to = await recipient.account('EUR');
    const fromBefore = await user.balanceOf(from);

    const response = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, currency: 'USD' })
    );
    expect(response.status()).toBe(400);
    expect(await user.balanceOf(from)).toBe(fromBefore);
});

for (const amount of [0, -100]) {
    test(`Should reject a transfer with amount ${amount}`, async ({ user, recipient }) => {
        const from = await user.account();
        const to = await recipient.account();

        const response = await user.createTransfer(
            buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount })
        );
        expect(response.status()).toBe(400);
    });
}

test("Should not transfer from another user's account", async ({ user, recipient }) => {
    const victim = await user.account();
    await user.fund(victim, 1_000);
    const to = await recipient.account();
    const victimBefore = await user.balanceOf(victim);

    const response = await recipient.createTransfer(
        buildTransferRequest({ idFromAccount: victim.id, idToAccount: to.id, amount: 500 })
    );
    expect(response.status()).toBe(404);
    expect(await user.balanceOf(victim)).toBe(victimBefore);
});

test('Should reject an unauthenticated transfer', async ({ request }) => {
    const response = await request.post('/api/transfers', {
        data: buildTransferRequest({ idFromAccount: 1, idToAccount: 2 }),
    });
    expect(response.status()).toBe(401);
});

test('Should not repeat a transfer with the same Idempotency-Key', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();
    const fromBefore = await user.balanceOf(from);
    const toBefore = await recipient.balanceOf(to);
    const transfer = buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 1_000 });
    const key = randomUUID();

    const first = await user.createTransfer(transfer, key);
    expect(first.status()).toBe(201);
    const second = await user.createTransfer(transfer, key);
    expect(second.status()).toBe(201);

    const { payload: firstTransfer } = (await first.json()) as ApiResponse<TransferDto>;
    const { payload: secondTransfer } = (await second.json()) as ApiResponse<TransferDto>;
    expect(secondTransfer.id).toBe(firstTransfer.id);

    expect(await user.balanceOf(from)).toBe(fromBefore - 1_000);
    expect(await recipient.balanceOf(to)).toBe(toBefore + afterFee(1_000));
});

test('Should reject a reused Idempotency-Key with a different request', async ({ user, recipient }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();
    const fromBefore = await user.balanceOf(from);
    const key = randomUUID();

    const first = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 1_000 }),
        key
    );
    expect(first.status()).toBe(201);

    const second = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 2_000 }),
        key
    );
    expect(second.status()).toBe(422);
    expect(await user.balanceOf(from)).toBe(fromBefore - 1_000);
});


test('Should not overdraw the account with concurrent transfers', async({user, recipient})=> {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();
    const fromBefore = await user.balanceOf(from);
    const toBefore = await recipient.balanceOf(to);

    const amount = Math.floor(fromBefore /3) + 1;
    const transfer = buildTransferRequest({idFromAccount:from.id, idToAccount: to.id, amount});

    const responses = await Promise.all(
        Array.from({length:5}, ()=> user.createTransfer(transfer))
    );

    let completed = 0;
    for(const response of responses) {
        if(response.status()===409) continue;
        expect(response.status(), await response.text()).toBe(201);

        const {payload} = (await response.json()) as ApiResponse<TransferDto>;

        expect(['COMPLETED','FAILED']).toContain(payload.status);
        if(payload.status ==='COMPLETED') completed++;
    }

    expect(completed).toBeGreaterThanOrEqual(1);
    expect(completed).toBeLessThanOrEqual(2);

    const fromAfter = await user.balanceOf(from);
    expect(fromAfter).toBeGreaterThanOrEqual(0);
    expect(fromAfter).toBe(fromBefore - completed * amount);
    expect(await recipient.balanceOf(to)).toBe(toBefore+completed * afterFee(amount));
})
