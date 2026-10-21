import { type Locator, type Page } from '@playwright/test';

export class MerchantHoldsPage {
    readonly holdsRefresh: Locator;
    readonly holdsLoadError: Locator;
    readonly holdsLoading: Locator;

    // table
    readonly merchantHoldsTable: Locator;
    readonly merchantHoldsTableRow: (id: string) => Locator;
    readonly merchantHoldsTableDetail: (id: string) => Locator;
    readonly merchantHoldsTableEmpty: Locator;
    readonly merchantHoldsTableLoading: Locator;
    readonly merchantHoldsTableError: Locator;
    readonly holdStatus: Locator;
    readonly holdRemove: Locator;

    // place hold
    readonly placeHoldForm: Locator;
    readonly placeHoldAccount: Locator;
    readonly placeHoldAccountList: Locator;
    readonly placeHoldAccountOption: (accountId: string) => Locator;
    readonly placeHoldAmount: Locator;
    readonly placeHoldCurrency: Locator;
    readonly placeHoldExpires: Locator;
    readonly placeHoldSubmit: Locator;
    readonly placeHoldError: Locator;

    // track hold
    readonly trackHoldForm: Locator;
    readonly trackHoldInput: Locator;
    readonly trackHoldSubmit: Locator;
    readonly trackHoldError: Locator;

    // hold actions
    readonly holdExpiredNotice: Locator;
    readonly holdActions: Locator;
    readonly holdCaptureAccount: Locator;
    readonly holdCapture: Locator;
    readonly holdNoCaptureAccount: Locator;
    readonly holdRelease: Locator;
    readonly holdActionError: Locator;

    constructor(private readonly page: Page) {
        this.holdsRefresh = page.getByTestId('holds-refresh');
        this.holdsLoadError = page.getByTestId('holds-load-error');
        this.holdsLoading = page.getByTestId('holds-loading');

        this.merchantHoldsTable = page.getByTestId('merchant-holds-table');
        this.merchantHoldsTableRow = (id) => page.getByTestId(`merchant-holds-table-row-${id}`);
        this.merchantHoldsTableDetail = (id) => page.getByTestId(`merchant-holds-table-detail-${id}`);
        this.merchantHoldsTableEmpty = page.getByTestId('merchant-holds-table-empty');
        this.merchantHoldsTableLoading = page.getByTestId('merchant-holds-table-loading');
        this.merchantHoldsTableError = page.getByTestId('merchant-holds-table-error');
        this.holdStatus = page.getByTestId('hold-status');
        this.holdRemove = page.getByTestId('hold-remove');

        this.placeHoldForm = page.getByTestId('place-hold-form');
        this.placeHoldAccount = page.getByTestId('place-hold-account');
        this.placeHoldAccountList = page.getByTestId('place-hold-account-list');
        this.placeHoldAccountOption = (accountId) => page.getByTestId(`place-hold-account-option-${accountId}`);
        this.placeHoldAmount = page.getByTestId('place-hold-amount');
        this.placeHoldCurrency = page.getByTestId('place-hold-currency');
        this.placeHoldExpires = page.getByTestId('place-hold-expires');
        this.placeHoldSubmit = page.getByTestId('place-hold-submit');
        this.placeHoldError = page.getByTestId('place-hold-error');

        this.trackHoldForm = page.getByTestId('track-hold-form');
        this.trackHoldInput = page.getByTestId('track-hold-input');
        this.trackHoldSubmit = page.getByTestId('track-hold-submit');
        this.trackHoldError = page.getByTestId('track-hold-error');

        this.holdExpiredNotice = page.getByTestId('hold-expired-notice');
        this.holdActions = page.getByTestId('hold-actions');
        this.holdCaptureAccount = page.getByTestId('hold-capture-account');
        this.holdCapture = page.getByTestId('hold-capture');
        this.holdNoCaptureAccount = page.getByTestId('hold-no-capture-account');
        this.holdRelease = page.getByTestId('hold-release');
        this.holdActionError = page.getByTestId('hold-action-error');
    }

    async goto() {
        await this.page.goto('/merchant/holds');
    }
}
