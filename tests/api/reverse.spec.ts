import {test, expect} from '@fixtures/user';
import {buildJournalReferenceQuery, buildReverseRequest,buildTransferRequest} from '@data/builders'
import type {ApiResponse, JournalEntryDto, PostingDirection, TransferDto} from '@api/types';
import type {WalletUser} from '@utils/WalletUser';
import { isErrored } from 'node:stream';
import { receiveMessageOnPort } from 'node:worker_threads';
import { json } from 'node:stream/consumers';
import { SimpleLocationModule } from '@faker-js/faker';

const afterFee = (amount: number) => amount - Math.floor((amount* 200)/10_000);


async function completedTransfer(user:WalletUser, recipient:WalletUser, amount: number): Promise<TransferDto> {
    const  from =  await user.account();
    await user.fund(from, amount*2);
    const to = await recipient.account();

    const response = await user.createTransfer(
        buildTransferRequest({
            idFromAccount: from.id,
            idToAccount: to.id,
            amount
        })
    );
    expect(response.status(), await response.text()).toBe(201);
    const {payload} = (await response.json()) as ApiResponse<TransferDto>;
    expect(payload.status).toBe('COMPLETED');
    return payload;
}

async function statusOf(user: WalletUser, transferId:number) {
    const response = await user.getTransfer(transferId);
    return ((await response.json()) as ApiResponse<TransferDto>).payload.status;
}

test('Should reverse a complteded transfer', async({ user, recipient, admin})=> {
    const from = await user.account();
    const to = await recipient.account();
    const transfer = await completedTransfer(user, recipient, 1_000);
    const fromBefore = await user. balanceOf(from);
    const toBefore = await recipient.balanceOf(to);

    const response = await admin.reverseTranfser(transfer.id, buildReverseRequest());
    expect(response.status(), await response.text()).toBe(202);

    const {payload} = (await response.json()) as ApiResponse<TransferDto>;
    expect(payload). toMatchObject({
        id: transfer.id,
        status: 'REVERSED'
    });
    expect(await statusOf(user, transfer.id)).toBe('REVERSED');

    expect(await user.balanceOf(from)).toBe(fromBefore+1_000);
    expect(await recipient.balanceOf(to)).toBe(toBefore- afterFee(1_000));
});

test('Should write a balanced REVERSAL journal entry', async ({user, recipient, admin})=> {
const transfer = await completedTransfer(user, recipient, 1_000);
const reason = 'Sent to the wrong account';

const reversed = await admin.reverseTranfser(transfer.id, buildReverseRequest({reason}));
expect(reversed.status(), await reversed.text()).toBe(202);

const response  = await admin.getJournalEntriesByReference(buildJournalReferenceQuery({id: transfer.id}));
expect(response.status()).toBe(200);
const {payload: entries} = (await response.json()) as ApiResponse<JournalEntryDto[]>;
expect (entries.map((e)=> e.entryType).sort()).toEqual(['REVERSAL','TRANSFER']);

const reversal = entries.find((e)=> e.entryType ==='REVERSAL')!;
expect(reversal.description).toContain(reason);

const total = (direction: PostingDirection) => reversal.postings.filter((p)=> p.direction===direction).reduce((sum,p)=> sum+p.amount,0);
expect(total('DEBIT')).toBe(total('CREDIT'));
expect(reversal.postings).toContainEqual(
    expect.objectContaining({
        accountId: transfer.fromAccountId,
        direction:'CREDIT',
        amount: 1_000
    })
);
expect(reversal.postings). toContainEqual(
    expect.objectContaining({
        accountId: transfer.toAccountId, direction:'DEBIT', amount: afterFee(1_000)
    })
);

});

test('should not reverse a transfer twiuce', async({
    user, recipient, admin
})=> {
    const from = await user.account();
    const transfer = await completedTransfer(user, recipient,1_000);

    const first = await admin.reverseTranfser(transfer.id, buildReverseRequest());
    expect(first.status(), first.text()).toBe(202);
    const fromAfterFirst = await user.balanceOf(from);

    const second = await admin.reverseTranfser(transfer.id, buildReverseRequest());
    expect(second.status()).toBe(202);
    const { payload } = (await second.json()) as ApiResponse<TransferDto>;
    expect(payload.status).toBe('REVERSED');

    expect(await user.balanceOf(from)).toBe(fromAfterFirst);
});

