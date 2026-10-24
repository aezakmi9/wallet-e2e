import {test, expect } from '@fixtures/logint'
import {UsersPage, UsersPage } from '@pages/UsersPage';
import { WalletUser } from '@utils/WalletUser'



test.use({storageState: {cookies:[],origins:[]}});

test('Should let an admin make a user a merchant', async ({
    page, authPage, apiRequest
})=> {
const user = await WalletUser.register(apiRequest);
const usersPage = new UsersPage(page);

await authPage.goto();
await authPage.loginEmail.fill();
await authPage.loginPassword.fill();
await authPage.loginSubmit.click();
await expect(page).not.toHaveURL(/\/login/);


await usersPage.goto();
await usersPage.usersSearchInput.fill(user.email);
await usersPage.usersSearchSubmit.click();
await expect(usersPage.usersTableLoading).toBeHidden();


const row = usersPage.usersTableRow(String(user.id));
await expect(row).toBeVisible();
await expect(row).toContainText(user.email)
await expect(row.getByTestId('user-role')).toHaveText('USER');
await expect(row.getByTestId('user-is-you')).toBeHidden();

await row.getByTestId('user-toggle-merchant').click();

await expect(usersPage.usersActionError).toBeHidden();
await expect(row.getByTestId('user-role')).toHaveText('MERCHANT');
await page.reload();
await usersPage.usersSearchInput.fill(user.email);
await usersPage.usersSearchInput.click();
await expect(row.getByTestId('user-role')).toHaveText('MERCHANT');

})