import { type Locator, type Page } from '@playwright/test';

export class OutboxPage {
    readonly outboxStatusFilter: Locator;
    readonly outboxRefresh: Locator;
    readonly outboxActionError: Locator;
    readonly outboxError: Locator;
    readonly outboxLoading: Locator;
    readonly outboxEmpty: Locator;

    // table
    readonly outboxTable: Locator;
    readonly outboxTableRow: (id: string) => Locator;
    readonly outboxTableDetail: (id: string) => Locator;
    readonly outboxEventStatus: Locator;
    readonly outboxRetry: Locator;
    readonly outboxEventPayload: Locator;

    // pager
    readonly outboxPager: Locator;
    readonly outboxPagerNewer: Locator;
    readonly outboxPagerOlder: Locator;
    readonly outboxPagerInfo: Locator;

    constructor(private readonly page: Page) {
        this.outboxStatusFilter = page.getByTestId('outbox-status-filter');
        this.outboxRefresh = page.getByTestId('outbox-refresh');
        this.outboxActionError = page.getByTestId('outbox-action-error');
        this.outboxError = page.getByTestId('outbox-error');
        this.outboxLoading = page.getByTestId('outbox-loading');
        this.outboxEmpty = page.getByTestId('outbox-empty');

        this.outboxTable = page.getByTestId('outbox-table');
        this.outboxTableRow = (id) => page.getByTestId(`outbox-table-row-${id}`);
        this.outboxTableDetail = (id) => page.getByTestId(`outbox-table-detail-${id}`);
        this.outboxEventStatus = page.getByTestId('outbox-event-status');
        this.outboxRetry = page.getByTestId('outbox-retry');
        this.outboxEventPayload = page.getByTestId('outbox-event-payload');

        this.outboxPager = page.getByTestId('outbox-pager');
        this.outboxPagerNewer = page.getByTestId('outbox-pager-newer');
        this.outboxPagerOlder = page.getByTestId('outbox-pager-older');
        this.outboxPagerInfo = page.getByTestId('outbox-pager-info');
    }

    async goto() {
        await this.page.goto('/admin/outbox');
    }
}
