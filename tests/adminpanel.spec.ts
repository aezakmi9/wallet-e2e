import { test, expect } from '@fixtures/logint';
import { UsersPage } from '@pages/UsersPage';
import { WalletUser } from '@utils/WalletUser';

// Logs in through the form as the admin instead of reusing the saved session
test.use({ storageState: { cookies: [], origins: [] } });

test('Should let an admin make a user a merchant', async ({ page, authPage, apiRequest }) => {
    const user = await WalletUser.register(apiRequest);
    const usersPage = new UsersPage(page);

    await authPage.goto();
    await authPage.login(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
    await expect(page).not.toHaveURL(/\/login/);

    await usersPage.goto();
    await usersPage.usersSearchInput.fill(user.email);
    await usersPage.usersSearchSubmit.click();
    await expect(usersPage.usersTableLoading).toBeHidden();

    const row = usersPage.usersTableRow(String(user.id));
    await expect(row).toBeVisible();
    await expect(row).toContainText(user.email);
    await expect(row.getByTestId('user-role')).toHaveText('USER');
    await expect(row.getByTestId('user-is-you')).toBeHidden();

    await row.getByTestId('user-toggle-merchant').click();

    await expect(usersPage.usersActionError).toBeHidden();
    await expect(row.getByTestId('user-role')).toHaveText('MERCHANT');

    // The change is saved, not just shown
    await page.reload();
    await usersPage.usersSearchInput.fill(user.email);
    await usersPage.usersSearchSubmit.click();
    await expect(row.getByTestId('user-role')).toHaveText('MERCHANT');
});
