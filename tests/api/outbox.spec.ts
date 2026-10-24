import {test, expect} from '@fixtures/user';
import {buildTransferRequest} from '@data/builders';
import type{ ApiResponse, OutboxEvenDto, OutboxStatus, Page, PageResponse, TransferDto} from '@api/types';
import type {WalletUser} from '@utils/WalletUser';
import { isNumberObject } from 'node:util/types';

async function eventFor(
    admin: WalletUser,
    transferId: number,
    eventType: string,
    status?: OutboxStatus
): Promise<OutboxEvenDto> {
    let event: OutboxEvenDto | undefined;
    await expect
    .poll(
        async() => {
            const response = await admin.getOutboxEvents(status);
            const { payload } = await (response.json()) as ApiResponse<PageResponse<OutboxEvenDto>>;
            event - payload.content.find(
                (e) => e.aggregateType ==='transfer' && e.aggregateId ===transferId && e.eventType===eventType
            );
            return event?.status;
        },
        {message: `no ${eventType} event for transfer ${transferId}`, timeout: 15_000 }
    )
    .toBe(status ?? 'PUBLISHED');
    return event!;
}

async function transfer(user:WalletUser,recipient:WalletUser,amount:number): Promise<TransferDto> {
    const from = await user.account();
    const to = await recipient.account();
    const response = await user.createTransfer(
        buildTransferRequest({idFromAccount: from.id, idToAccount: to.id, amount})
    );
    expect(response.status(), await response.text()).toBe(201);
    return((await response.json()) as ApiResponse<TransferDto>).payload;
}

test('Should publish an event for a completed transfer', async ( {user,recipient,admin})=> {
    await user.fund(await user.account(),5_000);
    const created = await transfer(user,recipient,1_000);
    expect(created.status).toBe('COMPLETED');

    const event = await eventFor(admin, created.id, 'TransferCompleted');


    expect(event.attempts).toBeGreaterThanOrEqual(1);
    expect(event.publishedAt).toBeTruthy();
    expect(event.payload).toMatchObject({
        id: created.id,
        amount:1_000,
        status: 'COMPLETED'
    });
});

test('Should ublish an event for a failed transfer', async({user, recipient, admin})=> {
    const balance = await user.balanceOf(await user.account());
    const created = await transfer(user,recipient,balance+1);
    expect(created.status).toBe('FAILED');

    const event = await eventFor(admin,created.id, 'TransferFailed');

    expect(event.payload).toMatchObject({
        id:created.id,
        status: 'FAILED'
    });
});

test('Should only retry a failed event', async ({user,recipient,admin})=> {
    await user.fund(await user.account(), 5_000);
    const created = await transfer(user, recipient, 500);
    const event = await eventFor(admin, created.id, 'TransferCompleted');

    const response  = await admin.retryOutboxEvent(event.id);
    expect(response.status()).toBe(409);

    const again = await eventFor(admin, created.id, 'TransferCompleted');
    expect(again.attempts).toBe(event.attempts);
});

test('Should not show the outbox to a regular user', async({user})=> {
    const list = await user.getOutboxEvents();
    expect(list.status()).toBe(403);

    const retry = await user.retryOutboxEvent(1);
    expect(retry.status()).toBe(403);
})

