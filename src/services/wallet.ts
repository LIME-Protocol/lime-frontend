/**
 * Wallet Abstraction Layer
 *
 * Provides plug-in interfaces for wallet connectivity, collateral management,
 * and market settlement. The architecture supports swapping between providers
 * without changing UI or business logic.
 *
 * Current: Mock implementation (MVP)
 * Planned: Solana (Anchor + SPL Token) via @solana/web3.js
 *
 * Solana integration path:
 *   1. SolanaWalletProvider  → wraps @solana/wallet-adapter
 *   2. SolanaCollateral      → interacts with an Anchor program for escrow
 *   3. SolanaSettlement       → calls the resolution + payout instructions
 */

// ── Core Interfaces ──

export interface WalletProvider {
  /** Connect wallet and return the public address */
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  isConnected(): boolean;
  /** Sign an arbitrary message (used for auth challenges) */
  signMessage(message: string): Promise<string>;
  /** Returns the chain identifier (e.g. 'solana-mainnet', 'solana-devnet') */
  getChain(): string;
}

export interface OnchainCollateral {
  /** Lock USDC collateral into the escrow program for a given market */
  lockCollateral(marketId: string, amount: number): Promise<string>;
  /** Release collateral back to the user (e.g. order cancelled) */
  releaseCollateral(marketId: string): Promise<string>;
  /** Query the user's locked balance for a market */
  getLockedBalance(marketId: string): Promise<number>;
  /** Get total collateral across all markets */
  getTotalLocked(): Promise<number>;
}

export interface OnchainSettlement {
  /** Submit the observed value and trigger payout calculation on-chain */
  resolveMarket(marketId: string, observedValue: number): Promise<string>;
  /** Claim the payout for a resolved market */
  claimPayout(marketId: string): Promise<string>;
  /** Check the payout lifecycle status */
  getPayoutStatus(marketId: string): Promise<'pending' | 'claimable' | 'claimed'>;
}

// ── Solana-specific types (for future implementation) ──

export interface SolanaConfig {
  network: 'mainnet-beta' | 'devnet' | 'localnet';
  programId: string;         // Anchor program address
  usdcMint: string;          // USDC SPL token mint
  escrowAuthority: string;   // PDA for escrow vault
}

export const SOLANA_DEFAULTS: Record<string, SolanaConfig> = {
  devnet: {
    network: 'devnet',
    programId: 'LIME_PROGRAM_ID_PLACEHOLDER',
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // devnet USDC
    escrowAuthority: 'LIME_ESCROW_PDA_PLACEHOLDER',
  },
  'mainnet-beta': {
    network: 'mainnet-beta',
    programId: 'LIME_PROGRAM_ID_PLACEHOLDER',
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // mainnet USDC
    escrowAuthority: 'LIME_ESCROW_PDA_PLACEHOLDER',
  },
};

// ── Mock Implementation (MVP) ──

class MockWalletProvider implements WalletProvider {
  private address: string | null = null;

  async connect() {
    this.address =
      '0x' +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
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

  getChain() {
    return 'mock';
  }
}

class MockCollateral implements OnchainCollateral {
  async lockCollateral(_marketId: string, _amount: number) {
    return '0xmocktx';
  }
  async releaseCollateral(_marketId: string) {
    return '0xmocktx';
  }
  async getLockedBalance(_marketId: string) {
    return 0;
  }
  async getTotalLocked() {
    return 0;
  }
}

class MockSettlement implements OnchainSettlement {
  async resolveMarket(_marketId: string, _observedValue: number) {
    return '0xmocktx';
  }
  async claimPayout(_marketId: string) {
    return '0xmocktx';
  }
  async getPayoutStatus(_marketId: string) {
    return 'pending' as const;
  }
}

// ── Exported Singletons ──
// Swap these when real Solana integration is ready:
//   import { SolanaWalletProvider, SolanaCollateral, SolanaSettlement } from './solana';
//   export const walletProvider = new SolanaWalletProvider(SOLANA_DEFAULTS.devnet);

export const walletProvider: WalletProvider = new MockWalletProvider();
export const collateralService: OnchainCollateral = new MockCollateral();
export const settlementService: OnchainSettlement = new MockSettlement();
