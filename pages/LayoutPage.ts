import { type Locator, type Page } from '@playwright/test';

export class LayoutPage {
    readonly authLoading: Locator;
    readonly topbar: Locator;
    readonly navBrand: Locator;
    readonly navAccounts: Locator;
    readonly navHolds: Locator;
    readonly navUsers: Locator;
    readonly navJournal: Locator;
    readonly navOutbox: Locator;
    readonly currentUserName: Locator;
    readonly logoutButton: Locator;

    constructor(private readonly page: Page) {
        this.authLoading = page.getByTestId('auth-loading');
        this.topbar = page.getByTestId('topbar');
        this.navBrand = page.getByTestId('nav-brand');
        this.navAccounts = page.getByTestId('nav-accounts');
        this.navHolds = page.getByTestId('nav-holds');
        this.navUsers = page.getByTestId('nav-users');
        this.navJournal = page.getByTestId('nav-journal');
        this.navOutbox = page.getByTestId('nav-outbox');
        this.currentUserName = page.getByTestId('current-user-name');
        this.logoutButton = page.getByTestId('logout-button');
    }

    async goto() {
        await this.page.goto('/');
    }
}
