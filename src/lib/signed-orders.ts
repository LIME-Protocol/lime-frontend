export const LIMIT_ORDER_SCHEMA = 'lime.signed-limit-order.v1' as const;
export const PRICE_SCALE = 1_000_000;

export type OrderAction = 'buy' | 'sell';
export type PositionExposure = 'long' | 'short';

export interface LimitOrderDraft {
  schema: typeof LIMIT_ORDER_SCHEMA;
  market_id: string;
  owner: string;
  action: OrderAction;
  exposure: PositionExposure;
  quantity: number;
  limit_price_scaled: number;
  expiry_ts: number;
  nonce: string;
  chain_id: string;
}

export interface BuildLimitOrderDraftInput {
  marketId: string;
  owner: string;
  action: OrderAction;
  quantity: number;
  limitPrice: number;
  expiryTs: number;
  nonce: string;
  chainId: string;
}

export interface SignedLimitOrder {
  payload: LimitOrderDraft;
  message: string;
  signature: string;
}

export function exposureForAction(action: OrderAction): PositionExposure {
  return action === 'buy' ? 'long' : 'short';
}

export function buildLimitOrderDraft(input: BuildLimitOrderDraftInput): LimitOrderDraft {
  return {
    schema: LIMIT_ORDER_SCHEMA,
    market_id: input.marketId,
    owner: input.owner,
    action: input.action,
    exposure: exposureForAction(input.action),
    quantity: input.quantity,
    limit_price_scaled: Math.round(input.limitPrice * PRICE_SCALE),
    expiry_ts: input.expiryTs,
    nonce: input.nonce,
    chain_id: input.chainId,
  };
}

export function serializeLimitOrderMessage(draft: LimitOrderDraft): string {
  return JSON.stringify({
    schema: draft.schema,
    market_id: draft.market_id,
    owner: draft.owner,
    action: draft.action,
    exposure: draft.exposure,
    quantity: draft.quantity,
    limit_price_scaled: draft.limit_price_scaled,
    expiry_ts: draft.expiry_ts,
    nonce: draft.nonce,
    chain_id: draft.chain_id,
  });
}
