import { describe, expect, it } from 'vitest';

import {
  buildLimitOrderDraft,
  serializeLimitOrderMessage,
} from './signed-orders';

describe('signed limit orders', () => {
  it('builds a deterministic wallet-signable limit order payload', () => {
    const draft = buildLimitOrderDraft({
      marketId: 'market-1',
      owner: 'wallet-1',
      action: 'buy',
      quantity: 25,
      limitPrice: 0.425,
      expiryTs: 1_800_000_000,
      nonce: 'nonce-1',
      chainId: 'solana-devnet',
    });

    expect(draft).toEqual({
      schema: 'lime.signed-limit-order.v1',
      market_id: 'market-1',
      owner: 'wallet-1',
      action: 'buy',
      exposure: 'long',
      quantity: 25,
      limit_price_scaled: 425_000,
      expiry_ts: 1_800_000_000,
      nonce: 'nonce-1',
      chain_id: 'solana-devnet',
    });

    expect(serializeLimitOrderMessage(draft)).toBe(
      '{"schema":"lime.signed-limit-order.v1","market_id":"market-1","owner":"wallet-1","action":"buy","exposure":"long","quantity":25,"limit_price_scaled":425000,"expiry_ts":1800000000,"nonce":"nonce-1","chain_id":"solana-devnet"}',
    );
  });

  it('maps sell actions to short exposure', () => {
    const draft = buildLimitOrderDraft({
      marketId: 'market-1',
      owner: 'wallet-1',
      action: 'sell',
      quantity: 10,
      limitPrice: 0.6,
      expiryTs: 1_800_000_000,
      nonce: 'nonce-2',
      chainId: 'solana-devnet',
    });

    expect(draft.exposure).toBe('short');
    expect(draft.limit_price_scaled).toBe(600_000);
  });
});
