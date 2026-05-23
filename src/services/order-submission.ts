import type { SignedLimitOrder } from '@/lib/signed-orders';

export type SignedOrderSubmissionStatus = 'signed' | 'accepted' | 'rejected';

export interface SignedOrderSubmissionResult {
  status: SignedOrderSubmissionStatus;
  orderId?: string;
  reason?: string;
}

export interface OrderSubmissionClient {
  submitSignedLimitOrder(order: SignedLimitOrder): Promise<SignedOrderSubmissionResult>;
}

export function isMatchingEngineConfigured(endpoint = import.meta.env.VITE_MATCHING_ENGINE_URL) {
  return Boolean(endpoint?.trim());
}

class HttpOrderSubmissionClient implements OrderSubmissionClient {
  constructor(private readonly endpoint: string | undefined) {}

  async submitSignedLimitOrder(order: SignedLimitOrder): Promise<SignedOrderSubmissionResult> {
    if (!this.endpoint) {
      throw new Error('Matching engine endpoint is not configured.');
    }

    const response = await fetch(`${this.endpoint.replace(/\/$/, '')}/orders/limit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      return {
        status: 'rejected',
        reason: `Matching engine rejected the order (${response.status}).`,
      };
    }

    const data = (await response.json()) as { orderId?: string; status?: SignedOrderSubmissionStatus; reason?: string };
    return {
      status: data.status ?? 'accepted',
      orderId: data.orderId,
      reason: data.reason,
    };
  }
}

export function createOrderSubmissionClient(endpoint = import.meta.env.VITE_MATCHING_ENGINE_URL): OrderSubmissionClient {
  return new HttpOrderSubmissionClient(endpoint);
}

export const orderSubmissionClient: OrderSubmissionClient = createOrderSubmissionClient();
