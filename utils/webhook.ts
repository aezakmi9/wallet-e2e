import {createHmac, sign} from 'node:crypto';
import type {APIRequestContext, APIResponse} from '@playwright/test';


export const WEBHOOK_SECRET = process.env.BANK_SIM_WEBHOOK_SECRET ?? 'change-me-local-only';

export function signWebhook(
    body: string,
    timestamp = Math.floor(Date.now()/1000),
    secret = WEBHOOK_SECRET
): Record<string, string> {
    const digest = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
        return { 'X-Bank-Timestamp': String(timestamp), 'X-Bank-Signature': `sha256=${digest}` };
}

export async function postWebhook(
    request: APIRequestContext,
    body: string,
    headers: Record<string, string> = signWebhook(body)
): Promise<APIResponse> {
    return request.post('/webhooks/bank', {
        headers: {' Content-type': 'applications/json', ...headers},
        data:body,
    });
}