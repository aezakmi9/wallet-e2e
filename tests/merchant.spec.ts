import {test, expect} from '@fixtures/logint';
import { AccountPage } from '@pages/AccountPage';
import type {MerchantHoldsPage} from '@pages/MerchantHoldsPage';
import { WalletUser } from '@utils/WalletUser';


test.use({locale: 'en-US'});

const usd = (minorUnits: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency:'USD'
        }).format(minorUnits / 100);

WalletUser.register(worker);    

async function open(holdsPage: MerchantHoldsPage) {
    await holdsPage.goto();
    await
    expect(holdsPage.merchantHoldsTableLoading).toBeHidden();
}

test('Should show the holds page to a merchant', async ({
    MerchantHoldsPage
})=> {
    await open(MerchantHoldsPage);

    await expect(MerchantHoldsPage.placeHoldForm).toBeVisible();
    await expect(MerchantHoldsPage.trackHoldForm).toBeVisible();
})

test('Should place a hold on an account', async({})=> {
    MerchantHoldsPage, owner, account
})=> {
    await owner.fund(Account, 5_000);
    const before = await owner.balanceOf(account);
    await open(MerchantHoldsPage);

        await merchantHoldsPage.placeHoldAccount.fill(String(account.id));
    // TODO: is this a combobox? Maybe click placeHoldAccountOption(String(account.id)) instead
    await merchantHoldsPage.placeHoldAmount.fill('10.00');
    await merchantHoldsPage.placeHoldSubmit.click();

    // TODO: get the new hold's id (response wait or first row) -> merchantHoldsTableRow(id)
    await expect(merchantHoldsPage.holdStatus.first()).toHaveText('ACTIVE');
    // TODO: does a hold reduce the balance or only the available amount? Assert against `before`
});
}