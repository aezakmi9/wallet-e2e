import { type Locator, type Page } from '@playwright/test';

export class AccountPage {
    // header
    readonly backToAccounts: Locator;
    readonly accountError: Locator;
    readonly accountLoading: Locator;
    readonly adminViewNotice: Locator;
    readonly accountTitle: Locator;
    readonly accountMeta: Locator;
    readonly accountStatus: Locator;
    readonly accountBalance: Locator;

    // tabs
    readonly tabTransfers: Locator;
    readonly tabDeposits: Locator;
    readonly tabHolds: Locator;
    readonly tabPostings: Locator;

    // transfers
    readonly transfersTable: Locator;
    readonly transfersTableRow: (id: string) => Locator;
    readonly transfersTableDetail: (id: string) => Locator;
    readonly transfersTableEmpty: Locator;
    readonly transfersTableLoading: Locator;
    readonly transfersTableError: Locator;
    readonly transferStatus: Locator;
    readonly transferJournalLink: Locator;
    readonly transferReverseButton: Locator;
    readonly transfersPager: Locator;
    readonly transfersPagerNewer: Locator;
    readonly transfersPagerOlder: Locator;
    readonly transfersPagerInfo: Locator;
    readonly transfersDisabledNotice: Locator;
    readonly transferForm: Locator;
    readonly transferToAccount: Locator;
    readonly transferToAccountList: Locator;
    readonly transferToAccountOption: (accountId: string) => Locator;
    readonly transferAmount: Locator;
    readonly transferSubmit: Locator;
    readonly transferError: Locator;
    readonly transferSuccess: Locator;
    readonly reverseForm: Locator;
    readonly reverseReason: Locator;
    readonly reverseSubmit: Locator;
    readonly reverseCancel: Locator;
    readonly reverseError: Locator;

    // deposits
    readonly depositsTable: Locator;
    readonly depositsTableRow: (id: string) => Locator;
    readonly depositsTableEmpty: Locator;
    readonly depositsTableLoading: Locator;
    readonly depositsTableError: Locator;
    readonly depositStatus: Locator;
    readonly depositsPager: Locator;
    readonly depositsPagerNewer: Locator;
    readonly depositsPagerOlder: Locator;
    readonly depositsPagerInfo: Locator;
    readonly depositForm: Locator;
    readonly depositAmount: Locator;
    readonly depositSubmit: Locator;
    readonly depositError: Locator;

    // holds
    readonly holdsReserved: Locator;
    readonly holdsActionError: Locator;
    readonly accountHoldsTable: Locator;
    readonly accountHoldsTableRow: (id: string) => Locator;
    readonly accountHoldsTableEmpty: Locator;
    readonly accountHoldsTableLoading: Locator;
    readonly accountHoldsTableError: Locator;
    readonly holdStatus: Locator;
    readonly holdExpireButton: Locator;
    readonly accountHoldsPager: Locator;
    readonly accountHoldsPagerNewer: Locator;
    readonly accountHoldsPagerOlder: Locator;
    readonly accountHoldsPagerInfo: Locator;

    // postings
    readonly postingsTable: Locator;
    readonly postingsTableRow: (id: string) => Locator;
    readonly postingsTableEmpty: Locator;
    readonly postingsTableLoading: Locator;
    readonly postingsTableError: Locator;
    readonly postingJournalLink: Locator;
    readonly postingsPager: Locator;
    readonly postingsPagerNewer: Locator;
    readonly postingsPagerOlder: Locator;
    readonly postingsPagerInfo: Locator;

    constructor(private readonly page: Page) {
        this.backToAccounts = page.getByTestId('back-to-accounts');
        this.accountError = page.getByTestId('account-error');
        this.accountLoading = page.getByTestId('account-loading');
        this.adminViewNotice = page.getByTestId('admin-view-notice');
        this.accountTitle = page.getByTestId('account-title');
        this.accountMeta = page.getByTestId('account-meta');
        this.accountStatus = page.getByTestId('account-status');
        this.accountBalance = page.getByTestId('account-balance');

        this.tabTransfers = page.getByTestId('tab-transfers');
        this.tabDeposits = page.getByTestId('tab-deposits');
        this.tabHolds = page.getByTestId('tab-holds');
        this.tabPostings = page.getByTestId('tab-postings');

        this.transfersTable = page.getByTestId('transfers-table');
        this.transfersTableRow = (id) => page.getByTestId(`transfers-table-row-${id}`);
        this.transfersTableDetail = (id) => page.getByTestId(`transfers-table-detail-${id}`);
        this.transfersTableEmpty = page.getByTestId('transfers-table-empty');
        this.transfersTableLoading = page.getByTestId('transfers-table-loading');
        this.transfersTableError = page.getByTestId('transfers-table-error');
        this.transferStatus = page.getByTestId('transfer-status');
        this.transferJournalLink = page.getByTestId('transfer-journal-link');
        this.transferReverseButton = page.getByTestId('transfer-reverse-button');
        this.transfersPager = page.getByTestId('transfers-pager');
        this.transfersPagerNewer = page.getByTestId('transfers-pager-newer');
        this.transfersPagerOlder = page.getByTestId('transfers-pager-older');
        this.transfersPagerInfo = page.getByTestId('transfers-pager-info');
        this.transfersDisabledNotice = page.getByTestId('transfers-disabled-notice');
        this.transferForm = page.getByTestId('transfer-form');
        this.transferToAccount = page.getByTestId('transfer-to-account');
        this.transferToAccountList = page.getByTestId('transfer-to-account-list');
        this.transferToAccountOption = (accountId) => page.getByTestId(`transfer-to-account-option-${accountId}`);
        this.transferAmount = page.getByTestId('transfer-amount');
        this.transferSubmit = page.getByTestId('transfer-submit');
        this.transferError = page.getByTestId('transfer-error');
        this.transferSuccess = page.getByTestId('transfer-success');
        this.reverseForm = page.getByTestId('reverse-form');
        this.reverseReason = page.getByTestId('reverse-reason');
        this.reverseSubmit = page.getByTestId('reverse-submit');
        this.reverseCancel = page.getByTestId('reverse-cancel');
        this.reverseError = page.getByTestId('reverse-error');

        this.depositsTable = page.getByTestId('deposits-table');
        this.depositsTableRow = (id) => page.getByTestId(`deposits-table-row-${id}`);
        this.depositsTableEmpty = page.getByTestId('deposits-table-empty');
        this.depositsTableLoading = page.getByTestId('deposits-table-loading');
        this.depositsTableError = page.getByTestId('deposits-table-error');
        this.depositStatus = page.getByTestId('deposit-status');
        this.depositsPager = page.getByTestId('deposits-pager');
        this.depositsPagerNewer = page.getByTestId('deposits-pager-newer');
        this.depositsPagerOlder = page.getByTestId('deposits-pager-older');
        this.depositsPagerInfo = page.getByTestId('deposits-pager-info');
        this.depositForm = page.getByTestId('deposit-form');
        this.depositAmount = page.getByTestId('deposit-amount');
        this.depositSubmit = page.getByTestId('deposit-submit');
        this.depositError = page.getByTestId('deposit-error');

        this.holdsReserved = page.getByTestId('holds-reserved');
        this.holdsActionError = page.getByTestId('holds-action-error');
        this.accountHoldsTable = page.getByTestId('account-holds-table');
        this.accountHoldsTableRow = (id) => page.getByTestId(`account-holds-table-row-${id}`);
        this.accountHoldsTableEmpty = page.getByTestId('account-holds-table-empty');
        this.accountHoldsTableLoading = page.getByTestId('account-holds-table-loading');
        this.accountHoldsTableError = page.getByTestId('account-holds-table-error');
        this.holdStatus = page.getByTestId('hold-status');
        this.holdExpireButton = page.getByTestId('hold-expire-button');
        this.accountHoldsPager = page.getByTestId('account-holds-pager');
        this.accountHoldsPagerNewer = page.getByTestId('account-holds-pager-newer');
        this.accountHoldsPagerOlder = page.getByTestId('account-holds-pager-older');
        this.accountHoldsPagerInfo = page.getByTestId('account-holds-pager-info');

        this.postingsTable = page.getByTestId('postings-table');
        this.postingsTableRow = (id) => page.getByTestId(`postings-table-row-${id}`);
        this.postingsTableEmpty = page.getByTestId('postings-table-empty');
        this.postingsTableLoading = page.getByTestId('postings-table-loading');
        this.postingsTableError = page.getByTestId('postings-table-error');
        this.postingJournalLink = page.getByTestId('posting-journal-link');
        this.postingsPager = page.getByTestId('postings-pager');
        this.postingsPagerNewer = page.getByTestId('postings-pager-newer');
        this.postingsPagerOlder = page.getByTestId('postings-pager-older');
        this.postingsPagerInfo = page.getByTestId('postings-pager-info');
    }

    async goto(id: string, tab: 'transfers' | 'deposits' | 'holds' | 'postings' = 'transfers') {
        await this.page.goto(`/accounts/${id}?tab=${tab}`);
    }
}
