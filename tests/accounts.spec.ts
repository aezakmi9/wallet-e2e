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

test('Should show the account details and switch tabs', async ({ page, accountPage, owner, account }) => {
    const balance = await owner.balanceOf(account);
    await open(accountPage, account);

    await expect(accountPage.accountTitle).toHaveText(`Account #${account.id}`);
    await expect(accountPage.accountMeta).toContainText('USD');
    await expect(accountPage.accountStatus).toHaveText('ACTIVE');
    await expect(accountPage.accountBalance).toHaveText(usd(balance));
    await expect(accountPage.adminViewNotice).toBeHidden();
    await expect(accountPage.transferForm).toBeVisible();

    await accountPage.tabDeposits.click();
    await expect(page).toHaveURL(/tab=deposits/);
    await expect(accountPage.depositForm).toBeVisible();

    await accountPage.tabPostings.click();
    await expect(page).toHaveURL(/tab=postings/);
    await expect(accountPage.transferForm).toBeHidden();
});

test('Should validate the forms before sending anything', async ({ accountPage, owner, account, recipient }) => {
    const to = await recipient.account();
    const balance = await owner.balanceOf(account);
    await open(accountPage, account);

    await accountPage.transferToAccount.fill(String(account.id));
    await accountPage.transferAmount.fill('10.00');
    await accountPage.transferSubmit.click();
    await expect(accountPage.transferError).toHaveText("You can't send money to the same account");

    await accountPage.transferToAccount.fill(String(to.id));
    await accountPage.transferAmount.fill('abc');
    await accountPage.transferSubmit.click();
    await expect(accountPage.transferError).toHaveText('Enter a positive amount, e.g. 25.00');

    await accountPage.tabDeposits.click();
    await accountPage.depositAmount.fill('0');
    await accountPage.depositSubmit.click();
    await expect(accountPage.depositError).toHaveText('Enter a positive amount, e.g. 25.00');

    expect(await owner.balanceOf(account)).toBe(balance);
});

test('Should top up the account', async ({ accountPage, owner, account }) => {
    const before = await owner.balanceOf(account);
    await open(accountPage, account);

    await accountPage.tabDeposits.click();
    await accountPage.depositAmount.fill('25.00');
    await accountPage.depositSubmit.click();

    await expect(accountPage.depositStatus.first()).toHaveText('SUCCEEDED', { timeout: 15_000 });
    await expect(accountPage.depositsTable.locator('tbody tr').first()).toContainText(usd(afterFee(2_500)));
    expect(await owner.balanceOf(account)).toBe(before + afterFee(2_500));
});

test('Should send money to another account', async ({ accountPage, owner, account, recipient }) => {
    await owner.fund(account, 5_000);
    const to = await recipient.account();
    const before = await owner.balanceOf(account);
    const recipientBefore = await recipient.balanceOf(to);
    await open(accountPage, account);

    await accountPage.transferToAccount.fill(String(to.id));
    await accountPage.transferAmount.fill('10.00');
    await accountPage.transferSubmit.click();

    await expect(accountPage.transferSuccess).toHaveText(`Sent ${usd(1_000)} to account #${to.id}.`);
    await expect(accountPage.accountBalance).toHaveText(usd(before - 1_000));
    await expect(accountPage.transferStatus.first()).toHaveText('COMPLETED');
    expect(await recipient.balanceOf(to)).toBe(recipientBefore + afterFee(1_000));
});

test('Should show why a transfer failed', async ({ accountPage, owner, account, recipient }) => {
    const to = await recipient.account();
    const before = await owner.balanceOf(account);
    await open(accountPage, account);

    await accountPage.transferToAccount.fill(String(to.id));
    await accountPage.transferAmount.fill(((before + 100) / 100).toFixed(2));
    await accountPage.transferSubmit.click();

    await expect(accountPage.transferError).toHaveText('Transfer failed: Insufficient funds');
    await expect(accountPage.accountBalance).toHaveText(usd(before));
});

test('Should show an error for an account that does not exist', async ({ accountPage }) => {
    await accountPage.goto('999999999');

    await expect(accountPage.accountError).toBeVisible();
    await expect(accountPage.backToAccounts).toBeVisible();
});
