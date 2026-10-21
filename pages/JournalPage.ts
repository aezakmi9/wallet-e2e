import { type Locator, type Page } from '@playwright/test';

export class JournalPage {
    // lookup
    readonly journalLookupForm: Locator;
    readonly journalLookupType: Locator;
    readonly journalLookupInput: Locator;
    readonly journalLookupSubmit: Locator;
    readonly journalLookupClear: Locator;
    readonly journalLookupError: Locator;

    // states
    readonly journalError: Locator;
    readonly journalLoading: Locator;
    readonly journalEmpty: Locator;

    // pager
    readonly journalPager: Locator;
    readonly journalPagerNewer: Locator;
    readonly journalPagerOlder: Locator;
    readonly journalPagerInfo: Locator;

    // table
    readonly journalTable: Locator;
    readonly journalTableRow: (id: string) => Locator;
    readonly journalTableDetail: (id: string) => Locator;

    // entry detail
    readonly journalEntryError: Locator;
    readonly journalEntryLoading: Locator;
    readonly journalEntryNoPostings: Locator;
    readonly journalPosting: (id: string) => Locator;
    readonly journalPostingAccountLink: Locator;

    constructor(private readonly page: Page) {
        this.journalLookupForm = page.getByTestId('journal-lookup-form');
        this.journalLookupType = page.getByTestId('journal-lookup-type');
        this.journalLookupInput = page.getByTestId('journal-lookup-input');
        this.journalLookupSubmit = page.getByTestId('journal-lookup-submit');
        this.journalLookupClear = page.getByTestId('journal-lookup-clear');
        this.journalLookupError = page.getByTestId('journal-lookup-error');

        this.journalError = page.getByTestId('journal-error');
        this.journalLoading = page.getByTestId('journal-loading');
        this.journalEmpty = page.getByTestId('journal-empty');

        this.journalPager = page.getByTestId('journal-pager');
        this.journalPagerNewer = page.getByTestId('journal-pager-newer');
        this.journalPagerOlder = page.getByTestId('journal-pager-older');
        this.journalPagerInfo = page.getByTestId('journal-pager-info');

        this.journalTable = page.getByTestId('journal-table');
        this.journalTableRow = (id) => page.getByTestId(`journal-table-row-${id}`);
        this.journalTableDetail = (id) => page.getByTestId(`journal-table-detail-${id}`);

        this.journalEntryError = page.getByTestId('journal-entry-error');
        this.journalEntryLoading = page.getByTestId('journal-entry-loading');
        this.journalEntryNoPostings = page.getByTestId('journal-entry-no-postings');
        this.journalPosting = (id) => page.getByTestId(`journal-posting-${id}`);
        this.journalPostingAccountLink = page.getByTestId('journal-posting-account-link');
    }

    async goto() {
        await this.page.goto('/admin/journal');
    }
}
