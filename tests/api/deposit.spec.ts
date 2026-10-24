import { test, expect } from '@fixtures/user';
import { buildDepositRequest } from '@data/builders';
import type { AccountDto, ApiErrorResponse, ApiResponse, DepositDto, DepositStatus, TransferDto } from '@api/types';
import { userInfo } from 'node:os';

const amount = -57;

test('Must create a deposit', async ({user}) => {
    const newUser = await user.account();

    const response = await user.createDeposit(
        buildDepositRequest({accountId: newUser.id, amount: 1_000})
    );

    expect(response.status()).toBe(201);

    const { payload } = (await response.json()) as ApiResponse<DepositDto>;
    expect(payload.status).toBe('COMPLETED');
});


test(`Should reject a deposit with amount ${amount}`, async ({ user }) => {
    const newUser = await user.account();

    const response = await user.createDeposit(
        buildDepositRequest({accountId: newUser.id, amount})
    );
        expect(response.status()).toBe(400);

});


test('Can not deposit another user account', async ({user, recipient}) => {
    const newUser = await user.account();
    const differentUser = await recipient.account(); 

    const response = await user.createDeposit(
    buildDepositRequest({accountId: differentUser.id, amount: 1_000})
    )

    expect(response.status()).toBe(403);

})