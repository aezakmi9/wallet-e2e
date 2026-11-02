import { test, expect } from '@fixtures/user';
import { buildJournalReferenceQuery, buildPageQuery, buildTransferRequest } from '@data/builders';
import type { ApiResponse, JournalEntryDto, Page, PostingDto, TransferDto } from '@api/types';

// The journal endpoints are admin only; postings can be read by the account's owner.

const sum = (postings: PostingDto[], direction: PostingDto['direction']) =>
    postings.filter((p) => p.direction === direction).reduce((total, p) => total + p.amount, 0);

test('Should write a balanced journal entry for a transfer', async ({ user, recipient, admin }) => {
    const from = await user.account();
    await user.fund(from, 5_000);
    const to = await recipient.account();

    const created = await user.createTransfer(
        buildTransferRequest({ idFromAccount: from.id, idToAccount: to.id, amount: 1_000 })
    );
    expect(created.status(), await created.text()).toBe(201);
    const { payload: transfer } = (await created.json()) as ApiResponse<TransferDto>;

    const response = await admin.getJournalEntriesByReference(buildJournalReferenceQuery({ id: transfer.id }));
    expect(response.status()).toBe(200);
    const { payload: entries } = (await response.json()) as ApiResponse<JournalEntryDto[]>;

    const entry = entries.find((e) => e.entryType === 'TRANSFER');
    expect(entry).toBeDefined();
    expect(sum(entry!.postings, 'DEBIT')).toBe(sum(entry!.postings, 'CREDIT'));
});

test('Should write a DEPOSIT entry when an account is funded', async ({ user, admin }) => {
    const account = await user.account();
    const deposit = await user.fund(account, 2_000);

    const response = await admin.getJournalEntriesByReference(
        buildJournalReferenceQuery({ type: 'deposit', id: deposit.id })
    );
    expect(response.status()).toBe(200);
    const { payload: entries } = (await response.json()) as ApiResponse<JournalEntryDto[]>;

    const entry = entries.find((e) => e.entryType === 'DEPOSIT');
    expect(entry).toBeDefined();
    expect(entry!.postings).toContainEqual(expect.objectContaining({ accountId: account.id, direction: 'CREDIT' }));
    expect(sum(entry!.postings, 'DEBIT')).toBe(sum(entry!.postings, 'CREDIT'));
});

test('Should page journal entries', async ({ user, admin }) => {
    // Makes sure there is at least one entry
    await user.fund(await user.account(), 1_000);

    const response = await admin.getJournalEntries(buildPageQuery({ size: 1 }));
    expect(response.status()).toBe(200);

    const { payload } = (await response.json()) as ApiResponse<Page<JournalEntryDto>>;
    expect(payload.size).toBe(1);
    expect(payload.content).toHaveLength(1);
});

test('Should return a journal entry by id', async ({ user, admin }) => {
    const deposit = await user.fund(await user.account(), 1_000);
    const byReference = await admin.getJournalEntriesByReference(
        buildJournalReferenceQuery({ type: 'deposit', id: deposit.id })
    );
    const { payload: entries } = (await byReference.json()) as ApiResponse<JournalEntryDto[]>;
    const entry = entries[0];
    expect(entry).toBeDefined();

    const response = await admin.getJournalEntry(entry!.id);
    expect(response.status()).toBe(200);
    const { payload } = (await response.json()) as ApiResponse<JournalEntryDto>;
    expect(payload).toMatchObject({ id: entry!.id, entryType: 'DEPOSIT', referenceId: deposit.id });
});

test('Should list postings for an account', async ({ user }) => {
    const account = await user.account();
    await user.fund(account, 1_000);

    const response = await user.getPostings(account.id, buildPageQuery());
    expect(response.status()).toBe(200);

    const { payload } = (await response.json()) as ApiResponse<Page<PostingDto>>;
    expect(payload.content.length).toBeGreaterThan(0);
    expect(payload.content.every((p) => p.accountId === account.id)).toBe(true);
});

test("Should not show another user's journal entries", async ({ user, recipient }) => {
    const journal = await user.getJournalEntries(buildPageQuery());
    expect(journal.status()).toBe(403);

    // Someone else's account gets the same 404 as a missing one
    const postings = await user.getPostings((await recipient.account()).id, buildPageQuery());
    expect(postings.status()).toBe(404);
});

test('Should reject an unauthenticated ledger request', async ({ request }) => {
    const response = await request.get('/api/journal-entries');
    expect(response.status()).toBe(401);
});

for (const query of [{ page: -1 }, { size: 0 }]) {
    test(`Should reject invalid paging ${JSON.stringify(query)}`, async ({ admin }) => {
        const response = await admin.getJournalEntries(buildPageQuery(query));
        expect(response.status()).toBe(400);
    });
}
