import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import type {
    AccountRequest,
    BankPaymentResult,
    DepositRequest,
    HoldCaptureRequest,
    HoldRequest,
    LoginRequest,
    PaymentRequest,
    RefreshTokenRequest,
    RegistrationRequest,
    ReverseRequest,
    Scenario,
    TransferRequest,
    UserRoleRequest,
} from '@api/types';

// Fields in K have no sensible default (usually ids) and must be passed in.
type Overrides<T, K extends keyof T = never> = Pick<T, K> & Partial<Omit<T, K>>;

export const DEFAULT_CURRENCY = 'USD';

// 8-72 chars with upper, lower, digit and special character
export function strongPassword(): string {
    return `${faker.internet.password({ length: 12 })}Aa1!`;
}

export function uniqueEmail(): string {
    return `e2e.${randomUUID()}@example.com`;
}

export function buildRegistrationRequest(
    overrides: Partial<RegistrationRequest> = {}
): RegistrationRequest {
    const password = overrides.password ?? strongPassword();
    return {
        name: faker.person.fullName(),
        email: uniqueEmail(),
        password,
        confirmPassword: password,
        ...overrides,
    };
}

export function buildLoginRequest(overrides: Partial<LoginRequest> = {}): LoginRequest {
    return {
        email: uniqueEmail(),
        password: strongPassword(),
        ...overrides,
    };
}

export function buildRefreshTokenRequest(
    overrides: Overrides<RefreshTokenRequest, 'refreshToken'>
): RefreshTokenRequest {
    return { ...overrides };
}

export function buildAccountRequest(overrides: Partial<AccountRequest> = {}): AccountRequest {
    return {
        currency: DEFAULT_CURRENCY,
        ...overrides,
    };
}

export function buildDepositRequest(
    overrides: Overrides<DepositRequest, 'accountId' | 'amount'>
): DepositRequest {
    return {
        currency: DEFAULT_CURRENCY,
        gateway: 'bank-sim',
        ...overrides,
    };
}

export function buildTransferRequest(
    overrides: Overrides<TransferRequest, 'idFromAccount' | 'idToAccount'>
): TransferRequest {
    return {
        amount: faker.number.int({ min: 1, max: 1_000 }),
        currency: DEFAULT_CURRENCY,
        ...overrides,
    };
}

export function buildReverseRequest(overrides: Partial<ReverseRequest> = {}): ReverseRequest {
    return {
        reason: faker.lorem.sentence({ min: 3, max: 6 }),
        ...overrides,
    };
}

export function buildHoldRequest(overrides: Overrides<HoldRequest, 'accountId'>): HoldRequest {
    return {
        amount: faker.number.int({ min: 1, max: 1_000 }),
        currency: DEFAULT_CURRENCY,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        ...overrides,
    };
}

export function buildHoldCaptureRequest(
    overrides: Overrides<HoldCaptureRequest, 'destinationAccountId'>
): HoldCaptureRequest {
    return { ...overrides };
}

export function buildUserRoleRequest(overrides: Partial<UserRoleRequest> = {}): UserRoleRequest {
    return {
        role: 'MERCHANT',
        ...overrides,
    };
}

export function buildPaymentRequest(
    overrides: Overrides<PaymentRequest, 'walletDepositId'>
): PaymentRequest {
    return {
        amount: faker.number.int({ min: 100, max: 100_000 }),
        currency: DEFAULT_CURRENCY,
        ...overrides,
    };
}

// Defaults to bank-sim's happy path
export function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
    return {
        outcome: 'APPROVE',
        declineRate: 0,
        latency: 'PT0S',
        failureRate: 0,
        lostResponseRate: 0,
        webhookMode: 'NORMAL',
        ...overrides,
    };
}

export function buildBankPaymentResult(
    overrides: Overrides<BankPaymentResult, 'walletDepositId'>
): BankPaymentResult {
    return {
        reference: `bsim_${randomUUID()}`,
        status: 'SUCCEEDED',
        amount: faker.number.int({ min: 100, max: 100_000 }),
        currency: DEFAULT_CURRENCY,
        occurredAt: new Date().toISOString(),
        ...overrides,
    };
}
