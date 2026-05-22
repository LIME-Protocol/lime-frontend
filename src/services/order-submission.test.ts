import { describe, expect, it } from 'vitest';

import { createOrderSubmissionClient, isMatchingEngineConfigured } from './order-submission';

describe('order submission', () => {
  it('reports whether the matching engine endpoint is configured', () => {
    expect(isMatchingEngineConfigured('https://matching.example')).toBe(true);
    expect(isMatchingEngineConfigured('')).toBe(false);
    expect(isMatchingEngineConfigured(undefined)).toBe(false);
  });

  it('blocks submission when the matching engine is not configured', async () => {
    const client = createOrderSubmissionClient('');

    await expect(client.submitSignedLimitOrder({
      payload: {
        schema: 'lime.signed-limit-order.v1',
        market_id: '1',
        owner: 'wallet',
        action: 'buy',
        exposure: 'long',
        quantity: 1,
        limit_price_scaled: 500_000,
        expiry_ts: 1_800_000_000,
        nonce: 'nonce',
        chain_id: 'solana-devnet',
      },
      message: '{}',
      signature: 'signature',
    })).rejects.toThrow('Matching engine endpoint is not configured.');
  });
});
