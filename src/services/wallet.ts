/**
 * Wallet abstraction layer.
 *
 * Currently a stub — all methods return mock/noop results.
 * When blockchain integration is added, implement the WalletProvider
 * interface with the real connector (e.g. ethers, viem, wagmi).
 */

export interface WalletProvider {
  connect(): Promise<string>;       // returns wallet address
  disconnect(): Promise<void>;
  getAddress(): string | null;
  isConnected(): boolean;
  signMessage(message: string): Promise<string>;
}

export interface OnchainCollateral {
  lockCollateral(marketId: string, amount: number): Promise<string>;   // tx hash
  releaseCollateral(marketId: string): Promise<string>;
  getLockedBalance(marketId: string): Promise<number>;
}

export interface OnchainSettlement {
  resolveMarket(marketId: string, observedValue: number): Promise<string>;
  claimPayout(marketId: string): Promise<string>;
  getPayoutStatus(marketId: string): Promise<'pending' | 'claimable' | 'claimed'>;
}

// ── Mock implementation (MVP) ──

class MockWalletProvider implements WalletProvider {
  private address: string | null = null;

  async connect() {
    // In the future, replace with real wallet connection
    this.address = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return this.address;
  }

  async disconnect() {
    this.address = null;
  }

  getAddress() {
    return this.address;
  }

  isConnected() {
    return this.address !== null;
  }

  async signMessage(_message: string) {
    return '0xmocksignature';
  }
}

class MockCollateral implements OnchainCollateral {
  async lockCollateral(_marketId: string, _amount: number) { return '0xmocktx'; }
  async releaseCollateral(_marketId: string) { return '0xmocktx'; }
  async getLockedBalance(_marketId: string) { return 0; }
}

class MockSettlement implements OnchainSettlement {
  async resolveMarket(_marketId: string, _observedValue: number) { return '0xmocktx'; }
  async claimPayout(_marketId: string) { return '0xmocktx'; }
  async getPayoutStatus(_marketId: string) { return 'pending' as const; }
}

// Singletons — swap these when real blockchain integration is ready
export const walletProvider: WalletProvider = new MockWalletProvider();
export const collateralService: OnchainCollateral = new MockCollateral();
export const settlementService: OnchainSettlement = new MockSettlement();
