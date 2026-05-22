export interface WalletProvider {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  isConnected(): boolean;
  signMessage(message: string): Promise<string>;
  getChain(): string;
}

export interface OnchainCollateral {
  depositCollateral(marketId: string, amount: number): Promise<string>;
  withdrawAvailableCollateral(marketId: string, amount: number): Promise<string>;
  /** @deprecated Use depositCollateral. */
  lockCollateral(marketId: string, amount: number): Promise<string>;
  /** @deprecated Use withdrawAvailableCollateral. */
  releaseCollateral(marketId: string, amount: number): Promise<string>;
  getLockedBalance(marketId: string): Promise<number>;
  getTotalLocked(): Promise<number>;
}

export type PositionSide = 'long' | 'short';

export interface OnchainSettlement {
  resolveMarket(marketId: string, observedValue: number): Promise<string>;
  claimPayout(marketId: string, side?: PositionSide): Promise<string>;
  refundIfInvalidated(marketId: string, side?: PositionSide): Promise<string>;
  getPayoutStatus(marketId: string, side?: PositionSide): Promise<'pending' | 'claimable' | 'claimed'>;
}
