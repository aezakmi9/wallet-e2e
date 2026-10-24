import { test, expect } from '@fixtures/logint';
import type { AccountPage } from '@pages/AccountPage';
import type { AccountDto } from '@api/types';


test.use({locale:'en-US'});


async function open(accountPage: AccountPage, account: AccountDto) {
    await accountPage.goto(String(account.id));
    await expect(accountPage.accountTitle).toBeVisible();
}

test('Should show the postings amount', async ({
    accountPage, owner, account
}) => {
    await owner.fund(account,5_000);
    await accountPage.tabHolds.click();
    await expect(accountPage.accountHoldsTable).toBeVisible();
    await expect(accountPage.accountHoldsTableError).toBeNull();
    await expect(accountPage.postingsTable).toContainText('5_000');

});



