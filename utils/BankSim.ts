import {expect } from '@playwright/test';
import type {APIRequestContext, APIResponse} from '@playwright/test';
import type {ApiResponse, PaymentDto, Scenario} from '@api/types';
import {buildScenario} from '@data/builders';

export class BankSim {
    constructor(private readonly request: APIRequestContext) {}

    async setScenario(ovverides: Partial<Scenario> = {}): Promise<void> {
        const response = await this.request.put('/control/scenario', {data: buildScenario(ovverides)});
        expect(response.status(), await response.text()).toBe(200);
    }

    async reset(): Promise<void> {
        const response = await this.request.delete('/control');
        expect(response.status(), await response.text()).toBe(204);
    }

        async getPayments(): Promise<APIResponse> {
        return this.request.get('/control/payments');
    }

    async resendWebhook(reference: string): Promise<APIResponse> {
        return this.request.post(`/control/payments/${reference}/webhook`);
    }

    async settledPaymentFor(depositId: number): Promise<PaymentDto> {
        let payment: PaymentDto | undefined;
        await expect 
        .poll(
            async () => {
                const payments = (await(await this.getPayments()).json()) as PaymentDto[];
                payment = payments.find((p)=> p.walletDepositId===String(depositId));
                return payment?.status;
            },
            { message: `bank-sim did not settle the payment for deposit ${depositId}`, timeout: 15_000 }
        )
        .toMatch(/SUCCEEDED|FAILED/);
        return payment!;
    }
}