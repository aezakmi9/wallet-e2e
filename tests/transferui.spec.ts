import { test, expect } from '@fixtures/logint';
import type { AccountPage } from '@pages/AccountPage';
import type { AccountDto } from '@api/types';

// Money is shown with the browser's locale
test.use({ locale: 'en-US' });

const usd = (minorUnits: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minorUnits / 100);

// Deposits and transfers both charge a 2% fee, rounded down
const afterFee = (amount: number) => amount - Math.floor((amount * 200) / 10_000);

// Waiting for the title also means the page has finished refreshing its session
async function open(accountPage: AccountPage, account: AccountDto) {
    await accountPage.goto(String(account.id));
    await expect(accountPage.accountTitle).toBeVisible();
}

test('Should show the postings amount', async ({ accountPage, owner, account }) => {
    await owner.fund(account, 5_000);
    await open(accountPage, account);

    await accountPage.tabPostings.click();
    await expect(accountPage.postingsTableError).toBeHidden();

    // Newest first: the deposit credits the account with what is left after the fee
    const latest = accountPage.postingsTable.locator('tbody tr').first();
    await expect(latest).toContainText('CREDIT');
    await expect(latest).toContainText(usd(afterFee(5_000)));
});
