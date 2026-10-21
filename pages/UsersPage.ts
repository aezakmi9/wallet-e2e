import { type Locator, type Page } from '@playwright/test';

export class UsersPage {
    readonly usersSearchForm: Locator;
    readonly usersSearchInput: Locator;
    readonly usersSort: Locator;
    readonly usersSearchSubmit: Locator;
    readonly usersActionError: Locator;

    // table
    readonly usersTable: Locator;
    readonly usersTableRow: (id: string) => Locator;
    readonly usersTableEmpty: Locator;
    readonly usersTableLoading: Locator;
    readonly usersTableError: Locator;
    readonly userIsYou: Locator;
    readonly userRole: Locator;
    readonly userToggleMerchant: Locator;

    // pager
    readonly usersPager: Locator;
    readonly usersPagerNewer: Locator;
    readonly usersPagerOlder: Locator;
    readonly usersPagerInfo: Locator;

    constructor(private readonly page: Page) {
        this.usersSearchForm = page.getByTestId('users-search-form');
        this.usersSearchInput = page.getByTestId('users-search-input');
        this.usersSort = page.getByTestId('users-sort');
        this.usersSearchSubmit = page.getByTestId('users-search-submit');
        this.usersActionError = page.getByTestId('users-action-error');

        this.usersTable = page.getByTestId('users-table');
        this.usersTableRow = (id) => page.getByTestId(`users-table-row-${id}`);
        this.usersTableEmpty = page.getByTestId('users-table-empty');
        this.usersTableLoading = page.getByTestId('users-table-loading');
        this.usersTableError = page.getByTestId('users-table-error');
        this.userIsYou = page.getByTestId('user-is-you');
        this.userRole = page.getByTestId('user-role');
        this.userToggleMerchant = page.getByTestId('user-toggle-merchant');

        this.usersPager = page.getByTestId('users-pager');
        this.usersPagerNewer = page.getByTestId('users-pager-newer');
        this.usersPagerOlder = page.getByTestId('users-pager-older');
        this.usersPagerInfo = page.getByTestId('users-pager-info');
    }

    async goto() {
        await this.page.goto('/admin/users');
    }
}
