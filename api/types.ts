// Types for the Wallet Platform API (wallet-platform.openapi.json).
// Money amounts are integers in minor units, timestamps are ISO-8601 UTC strings.

// ---------- enums ----------

export type AccountType = 'USER' | 'SYSTEM';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type UserRole = 'USER' | 'ADMIN' | 'MERCHANT';
export type AssignableUserRole = 'USER' | 'MERCHANT';
export type UserSortField = 'NAME' | 'EMAIL';
export type DepositStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
export type HoldStatus = 'ACTIVE' | 'CAPTURED' | 'RELEASED' | 'EXPIRED';
export type TransferStatus = 'COMPLETED' | 'FAILED' | 'REVERSED';
export type JournalEntryType =
    | 'TRANSFER'
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'FEE'
    | 'HOLD_CAPTURE'
    | 'HOLD_RELEASE'
    | 'REVERSAL';
export type PostingDirection = 'DEBIT' | 'CREDIT';
export type OutboxStatus = 'PENDING' | 'PUBLISHED' | 'FAILED';
export type BankPaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type ScenarioOutcome = 'APPROVE' | 'DECLINE' | 'RANDOM';
export type WebhookMode = 'NORMAL' | 'DUPLICATE' | 'DROP';

// ---------- requests ----------

export type RegistrationRequest = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RefreshTokenRequest = {
    refreshToken: string;
};

export type AccountRequest = {
    currency: string;
};

export type DepositRequest = {
    accountId: number;
    amount: number;
    currency: string;
    gateway: string;
    gatewayReference?: string | null;
};

export type TransferRequest = {
    idFromAccount: number;
    idToAccount: number;
    amount: number;
    currency: string;
};

export type ReverseRequest = {
    reason: string;
};

export type HoldRequest = {
    accountId: number;
    amount: number;
    currency: string;
    expiresAt: string;
};

export type HoldCaptureRequest = {
    destinationAccountId: number;
};

export type UserRoleRequest = {
    role: AssignableUserRole;
};

// bank-sim
export type PaymentRequest = {
    amount: number;
    currency: string;
    walletDepositId: string;
};

export type Scenario = {
    outcome: ScenarioOutcome;
    declineRate: number;
    latency: string;
    failureRate: number;
    lostResponseRate: number;
    webhookMode: WebhookMode;
};

// webhook body sent by bank-sim to /webhooks/bank
export type BankPaymentResult = {
    reference: string;
    walletDepositId: string;
    status: BankPaymentStatus;
    amount: number;
    currency: string;
    failureReason?: string | null;
    occurredAt: string;
};

// ---------- responses ----------

export type ApiResponse<T> = {
    message: string;
    payload: T;
    success: boolean;
};

export type ApiErrorResponse = {
    message: string;
    payload?: Record<string, string> | null;
    success: false;
};

export type Page<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export type AppUserDto = {
    id: number;
    createdAt?: string;
    updatedAt?: string | null;
    name: string;
    email: string;
    role: UserRole;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AppUserDto;
};

export type AccountDto = {
    id: number;
    createdAt?: string;
    updatedAt?: string | null;
    balance: number;
    currency: string;
    type: AccountType;
    status: AccountStatus;
    userId?: number | null;
};

export type DepositDto = {
    id: number;
    createdAt?: string;
    updatedAt?: string | null;
    accountId: number;
    amount: number;
    currency: string;
    gateway: string;
    gatewayReference?: string | null;
    status: DepositStatus;
    failureReason?: string | null;
    expiresAt?: string | null;
};

export type TransferDto = {
    id: number;
    createdAt?: string;
    updatedAt?: string | null;
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    currency: string;
    status: TransferStatus;
    failureReason?: string | null;
};

export type HoldDto = {
    id: number;
    createdAt?: string;
    updatedAt?: string | null;
    accountId: number;
    amount: number;
    currency: string;
    status: HoldStatus;
    expiresAt: string;
    capturedEntryId?: number | null;
    releasedAt?: string | null;
    merchantId?: number | null;
};

export type PostingDto = {
    id: number;
    journalEntryId: number;
    accountId: number;
    direction: PostingDirection;
    amount: number;
    currency: string;
    createdAt?: string;
};

export type JournalEntryDto = {
    id: number;
    createdAt?: string;
    entryType: JournalEntryType;
    description?: string | null;
    referenceType?: string | null;
    referenceId?: number | null;
    postings: PostingDto[];
};

export type OutboxEventDto = {
    id: number;
    createdAt?: string;
    publishedAt?: string | null;
    aggregateType: string;
    aggregateId: number;
    eventType: string;
    payload: Record<string, unknown>;
    status: OutboxStatus;
    attempts: number;
    lastError?: string | null;
};

export type PaymentDto = {
    reference: string;
    amount: number;
    currency: string;
    walletDepositId: string;
    status: BankPaymentStatus;
    failureReason?: string | null;
    webhookAttempts: number;
    webhookDeliveredAt?: string | null;
    createdAt: string;
};

export type NotificationDto = {
    id: number;
    createdAt?: string;
    eventType: string;
    title: string;
    body: string;
    readAt?: string | null;
};

export type UnreadCountDto = {
    unread: number;
};

// bank-sim and notification-service errors
export type SpringErrorResponse = {
    timestamp?: string;
    status: number;
    error: string;
    path?: string;
};

export type Jwk = {
    kty: string;
    use: string;
    alg: string;
    kid: string;
    n: string;
    e: string;
};

export type JwkSet = {
    keys: Jwk[];
};

export type HealthStatus = {
    status: string;
};
