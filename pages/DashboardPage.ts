import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
    readonly openAccountForm: Locator;
    readonly openAccountCurrency: Locator;
    readonly openAccountSubmit: Locator;
    readonly openAccountError: Locator;
    readonly accountsError: Locator;
    readonly accountsLoading: Locator;
    readonly accountsEmpty: Locator;
    readonly accountCards: Locator;
    readonly accountCard: (id: string) => Locator;
    readonly accountCardStatus: Locator;
    readonly accountCardBalance: Locator;
    readonly accountCardCurrency: Locator;
    readonly accountLookupForm: Locator;
    readonly accountLookupInput: Locator;
    readonly accountLookupSubmit: Locator;
    readonly accountLookupError: Locator;

    constructor(private readonly page: Page) {
        this.openAccountForm = page.getByTestId('open-account-form');
        this.openAccountCurrency = page.getByTestId('open-account-currency');
        this.openAccountSubmit = page.getByTestId('open-account-submit');
        this.openAccountError = page.getByTestId('open-account-error');
        this.accountsError = page.getByTestId('accounts-error');
        this.accountsLoading = page.getByTestId('accounts-loading');
        this.accountsEmpty = page.getByTestId('accounts-empty');
        this.accountCards = page.getByTestId('account-cards');
        this.accountCard = (id) => page.getByTestId(`account-card-${id}`);
        this.accountCardStatus = page.getByTestId('account-card-status');
        this.accountCardBalance = page.getByTestId('account-card-balance');
        this.accountCardCurrency = page.getByTestId('account-card-currency');
        this.accountLookupForm = page.getByTestId('account-lookup-form');
        this.accountLookupInput = page.getByTestId('account-lookup-input');
        this.accountLookupSubmit = page.getByTestId('account-lookup-submit');
        this.accountLookupError = page.getByTestId('account-lookup-error');
    }

    async goto() {
        await this.page.goto('/');
    }
}
