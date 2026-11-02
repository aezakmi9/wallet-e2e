import {test, expect} from '@fixtures/user';
import {buildHoldRequest} from '@data/builders';
import type {AccountDto, ApiResponse, HoldDto, PageResponse} from '@api/types';
import type { WalletUser} from '@utils/WalletUser';
import { toBuffer } from 'node:ffi';



async function heldOn(owner: WalletUser, account: AccountDto): Promise<number> {
    const response = await owner.getAccountHolds(account.id, {page:0,size:100});
    expect(response.status(), await response.text()).toBe(200);
    const {payload} = (await response.json()) as ApiResponse<PageResponse<HoldDto>>;
    return payload.content
    .filter((h)-> h.status ==='ACTIVE' && Date.parse(h.expiresAt) > Date.now())
    .reduce((sum,h)=> sum + h.amount,0)
}

test('should reserve the held amount without changing the balance', async ({
    user,merchant
})=> {
    const account = await user.account();
    await user.fund(account,5_000);
    const before = await user.balanceOf(account);
    const available = before - (await heldOn(user,account));

    const response = await merchant.placeHold(
        buildHoldRequest({accountId:account.id, amount: available})
    );
    expect(response.status(), await response.text()).toBe(201);
    const {payload: hold} = (await response.json()) as ApiResponse<HoldDto>;

    try {
        expect(hold.status).toBe('ACTIVE');
        expect(hold.amount).toBe(available);

        expect(await user.balanceOf(account)).toBe(before);

        const next = await merchant.placeHold(buildHoldRequest({accountId: account.id, amount:1}));
        expect(next.status()).toBe(409);
    } finally {
        await merchant.releaseHold(hold.id);
    }
})
