import { test, expect } from '@fixtures/logint';
import type { MerchantHoldsPage } from '@pages/MerchantHoldsPage';
import type { ApiResponse, HoldDto } from '@api/types';

// Money is shown with the browser's locale
test.use({ locale: 'en-US' });

const usd = (minorUnits: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minorUnits / 100);

// The list is rebuilt from the holds this browser placed, so it only shows once they are re-read
async function open(holdsPage: MerchantHoldsPage) {
    await holdsPage.goto();
    await expect(holdsPage.placeHoldForm).toBeVisible();
    await expect(holdsPage.holdsLoading).toBeHidden();
}

test('Should show the holds page to a merchant', async ({ merchantHoldsPage }) => {
    await open(merchantHoldsPage);

    await expect(merchantHoldsPage.placeHoldForm).toBeVisible();
    await expect(merchantHoldsPage.trackHoldForm).toBeVisible();
});

test('Should place a hold on an account', async ({ page, merchantHoldsPage, owner, account }) => {
    await owner.fund(account, 5_000);
    const before = await owner.balanceOf(account);
    await open(merchantHoldsPage);

    // The picker takes a typed account number; its suggestions are optional
    await merchantHoldsPage.placeHoldAccount.fill(String(account.id));
    await merchantHoldsPage.placeHoldAmount.fill('10.00');
    const created = page.waitForResponse(
        (r) => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/holds'
    );
    await merchantHoldsPage.placeHoldSubmit.click();

    const response = await created;
    expect(response.status(), await response.text()).toBe(201);
    const { payload: hold } = (await response.json()) as ApiResponse<HoldDto>;

    await expect(merchantHoldsPage.placeHoldError).toBeHidden();
    const row = merchantHoldsPage.merchantHoldsTableRow(String(hold.id));
    await expect(row).toContainText(`#${account.id}`);
    await expect(row).toContainText(usd(1_000));
    await expect(row.getByTestId('hold-status')).toHaveText('ACTIVE');

    // A hold only reserves the money: the balance stays the same until it is captured
    expect(await owner.balanceOf(account)).toBe(before);
});
