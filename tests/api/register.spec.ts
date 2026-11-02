import { test, expect } from '@playwright/test';
import { buildRegistrationRequest, uniqueEmail } from '@data/builders';
import type { AccountDto, ApiErrorResponse, ApiResponse, AuthResponse } from '@api/types';

// Every request here counts towards the API's limit of 20 POSTs to /api/auth/** per IP
// per minute, shared with the users the other specs register. Keep this file small.

test('Should register a new user', async ({ request }) => {
    const data = buildRegistrationRequest();
    const response = await request.post('/api/auth/register', { data });
    expect(response.status()).toBe(201);

    const { payload } = (await response.json()) as ApiResponse<AuthResponse>;
    expect(payload.accessToken).toBeTruthy();
    expect(payload.refreshToken).toBeTruthy();
    expect(payload.user).toMatchObject({ name: data.name, email: data.email, role: 'USER' });
    expect(payload).not.toHaveProperty('user.password');

    const accounts = await request.get('/api/accounts', {
        headers: { Authorization: `${payload.tokenType} ${payload.accessToken}` },
    });
    expect(accounts.status()).toBe(200);
    const { payload: list } = (await accounts.json()) as ApiResponse<AccountDto[]>;
    expect(list).toEqual([]);
});

test('Should reject an email that is already taken, ignoring case', async ({ request }) => {
    const email = uniqueEmail();
    const first = await request.post('/api/auth/register', {
        data: buildRegistrationRequest({ email }),
    });
    expect(first.status()).toBe(201);

    const second = await request.post('/api/auth/register', {
        data: buildRegistrationRequest({ email: email.toUpperCase() }),
    });
    expect(second.status()).toBe(409);
});

test('Should reject invalid email', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
        data: buildRegistrationRequest({ email: 'invalid email @' }),
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
});

test('Should reject passwords that do not match', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
        data: buildRegistrationRequest({ password: 'Secret123!', confirmPassword: 'Secret123?' }),
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as ApiErrorResponse;
    expect(body.success).toBe(false);
});

for (const [rule, password] of [
    ['is too short', 'Ab1!xyz'],
    ['has no special character', 'Secret1234'],
] as const) {
    test(`Should reject a password that ${rule}`, async ({ request }) => {
        const response = await request.post('/api/auth/register', {
            data: buildRegistrationRequest({ password }),
        });

        expect(response.status()).toBe(400);
    });
}

test('Should reject a blank name', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
        data: buildRegistrationRequest({ name: '   ' }),
    });

    expect(response.status()).toBe(400);
});
