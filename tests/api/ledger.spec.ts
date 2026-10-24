import { test, expect } from '@fixtures/user';
import { buildJournalReferenceQuery, buildPageQuery, buildTransferRequest } from '@data/builders';
import type { ApiResponse, JournalEntryDto, Page, PostingDto, TransferDto } from '@api/types';
import { create } from 'domain';


const sum = (postings: PostingDto[],
    direction: PostingDto['direction'])=>
        postings.filter((p)=> p.direction === direction).reduce((total,p) => total+p.amount,0);


    test('Should write a balanced journal entry for a transfer', async({
        user, recipient}) => {
            const from = await user.account();
            await user.fund(from,5_000);
            const to = await recipient.account();


            const created = await user.createTransfer(
                buildTransferRequest({
                    idFromAccount: from.id, idToAccount: to.id, amount: 1_000})
            );

            expect(created.status(), await created.text()).toBe(201);
            const{payload: transfer} = (await created.json()) as ApiResponse<TransferDto>;

            const response = await user.getJournalEntriesByReference(
                buildJournalReferenceQuery({id:transfer.id})
            );
            expect(response.status()).toBe(200)        

            const {payload: entries } = (await response.json()) as ApiResponse<JournalEntryDto[]>;

            const entry = entries.find((e)=> e.entryType==='TRANSFER');
            expect(entry).toBeDefined();
            expect(sum(entry!.postings,'DEBIT')).toBe(sum(entry!.postings,'CREDIT'));
        
        });

        test('Should write a DEPOSIT entry when an account is funded', async ({ user })=> {
            const account = await user.account();
            const deposit = await user.fund(account,2_000);

                    const response = await user.getJournalEntriesByReference(
                buildJournalReferenceQuery({id:transfer.id})
            );
                        expect(response.status()).toBe(200)        

        });

        test('Should page journal entries', async ({ user})=> {
            const response = await user.getJournalEntries(buildPageQuery({size:1}));
            expect(response.status()).toBe(200);


            const {payload} = (await response.json()) as
            ApiResponse<Page<JournalEntryDto>>;
            expect(payload.size).toBe(1);
            expect(payload.content).toHaveLength(1);
        });

        test('Should return a journal entry by id', async ({ user})=> {

        });

        test('Should list postings for an account', async({user })=> {

        });

        test("Should not show another user's journal entries", async({user,recipient}) => {

        });

        test('Should reject and unauthenticated ledger request', async ({request})=> {
            const response = await request.get('/api/journal-entries');
            expect(response.status()).toBe(401);
        });

        for(const query of [{page: -1}, {size: 0}]) {
            test(`Should reject invalid paging ${JSON.stringify(query)}`,async ({user })=> {
                
            })
        }



