import { expect } from '@playwright/test';
import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
    AccountDto,
    AccountRequest,
    ApiResponse,
    AuthResponse,
    DepositDto,
    DepositRequest,
    RegistrationRequest,
    TransferRequest,
} from '@api/types';
import {
    DEFAULT_CURRENCY,
    buildAccountRequest,
    buildDepositRequest,
    buildLoginRequest,
    buildRegistrationRequest,
} from '@data/builders';

export class WalletUser {
    constructor(
        public readonly id: number,
        public readonly email: string,
        public readonly password: string,
        private readonly request: APIRequestContext,
        private token: string,
        // Single use: whoever spends it (e.g. the frontend on page load) must hand back the new one
        public refreshToken: string
    ) {}

    // Registers a new user through the API (which saves it in the database) and
    // returns it already logged in: /register responds with the tokens.
    static async register(
        request: APIRequestContext,
        overrides: Partial<RegistrationRequest> = {}
    ): Promise<WalletUser> {
        const data = buildRegistrationRequest(overrides);
        const response = await request.post('/api/auth/register', { data });
        expect(response.status(), await response.text()).toBe(201);

        const { payload } = (await response.json()) as ApiResponse<AuthResponse>;
        return new WalletUser(
            payload.user.id,
            data.email,
            data.password,
            request,
            payload.accessToken,
            payload.refreshToken
        );
    }

    // Gets a fresh token pair, e.g. when the refresh token was spent and the new one is lost.
    async login(): Promise<void> {
        const response = await this.request.post('/api/auth/login', {
            data: buildLoginRequest({ email: this.email, password: this.password }),
        });
        expect(response.status(), await response.text()).toBe(200);
        const { payload } = (await response.json()) as ApiResponse<AuthResponse>;
        this.token = payload.accessToken;
        this.refreshToken = payload.refreshToken;
    }

    private get headers() {
        return { Authorization: `Bearer ${this.token}` };
    }

    // ---------- raw calls: return the response so tests can assert on it ----------

    async createAccount(account: AccountRequest): Promise<APIResponse> {
        return this.request.post('/api/accounts', { headers: this.headers, data: account });
    }

    async getAccounts(): Promise<APIResponse> {
        return this.request.get('/api/accounts', { headers: this.headers });
    }

    async getAccount(id: number): Promise<APIResponse> {
        return this.request.get(`/api/accounts/${id}`, { headers: this.headers });
    }

    async createDeposit(deposit: DepositRequest): Promise<APIResponse> {
        return this.request.post('/api/deposits', { headers: this.headers, data: deposit });
    }

    async getDeposit(id: number): Promise<APIResponse> {
        return this.request.get(`/api/deposits/${id}`, { headers: this.headers });
    }

    async createTransfer(transfer: TransferRequest, idempotencyKey?: string): Promise<APIResponse> {
        return this.request.post('/api/transfers', {
            headers: idempotencyKey
                ? { ...this.headers, 'Idempotency-Key': idempotencyKey }
                : this.headers,
            data: transfer,
        });
    }

    async getTransfer(id: number): Promise<APIResponse> {
        return this.request.get(`/api/transfers/${id}`, { headers: this.headers });
    }

    // ---------- setup helpers: fail fast and return the payload ----------

    async openAccount(overrides: Partial<AccountRequest> = {}): Promise<AccountDto> {
        const response = await this.createAccount(buildAccountRequest(overrides));
        expect(response.status(), await response.text()).toBe(201);
        return ((await response.json()) as ApiResponse<AccountDto>).payload;
    }

    // A user can only have one account per currency, so reuse it if it's already open.
    async account(currency: string = DEFAULT_CURRENCY): Promise<AccountDto> {
        const response = await this.getAccounts();
        expect(response.status(), await response.text()).toBe(200);
        const { payload } = (await response.json()) as ApiResponse<AccountDto[]>;
        return payload.find((a) => a.currency === currency) ?? this.openAccount({ currency });
    }

    async balanceOf(account: AccountDto): Promise<number> {
        const response = await this.getAccount(account.id);
        expect(response.status(), await response.text()).toBe(200);
        return ((await response.json()) as ApiResponse<AccountDto>).payload.balance;
    }

    // Deposits go through bank-sim and settle asynchronously, so poll until settled.
    async fund(account: AccountDto, amount: number): Promise<DepositDto> {
        const response = await this.createDeposit(
            buildDepositRequest({ accountId: account.id, amount, currency: account.currency })
        );
        expect(response.status(), await response.text()).toBe(201);
        const { payload: created } = (await response.json()) as ApiResponse<DepositDto>;

        let deposit = created;
        await expect
            .poll(
                async () => {
                    const res = await this.getDeposit(created.id);
                    deposit = ((await res.json()) as ApiResponse<DepositDto>).payload;
                    return deposit.status;
                },
                { message: `deposit ${created.id} did not settle`, timeout: 15_000 }
            )
            .not.toBe('PENDING');
        expect(deposit.status, deposit.failureReason ?? '').toBe('SUCCEEDED');
        return deposit;
    }
}
