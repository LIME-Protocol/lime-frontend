import { describe, expect, it } from 'vitest';

import { readSolanaConfig, requireSolanaConfig } from './solana';

describe('solana config', () => {
  it('reads the SDK-facing Solana env vars', () => {
    expect(readSolanaConfig({
      VITE_SOLANA_RPC_URL: 'https://api.devnet.solana.com',
      VITE_SOLANA_USDC_MINT: 'usdc-mint',
      VITE_LIME_MARKET_PROGRAM_ID: 'market-program',
      VITE_LIME_VAULT_PROGRAM_ID: 'vault-program',
      VITE_LIME_SETTLEMENT_PROGRAM_ID: 'settlement-program',
    })).toEqual({
      enabled: true,
      missing: [],
      network: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      usdcMint: 'usdc-mint',
      marketProgramId: 'market-program',
      vaultProgramId: 'vault-program',
      settlementProgramId: 'settlement-program',
    });
  });

  it('reports missing variables without throwing at app boot', () => {
    const config = readSolanaConfig({
      VITE_SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
    });

    expect(config.enabled).toBe(false);
    expect(config.missing).toEqual([
      'VITE_SOLANA_USDC_MINT',
      'VITE_LIME_MARKET_PROGRAM_ID',
      'VITE_LIME_VAULT_PROGRAM_ID',
      'VITE_LIME_SETTLEMENT_PROGRAM_ID',
    ]);
    expect(config.network).toBe('mainnet-beta');
  });

  it('throws a clear error when a caller requires a complete config', () => {
    expect(() => requireSolanaConfig({})).toThrow(
      'Missing Solana configuration: VITE_SOLANA_RPC_URL, VITE_SOLANA_USDC_MINT, VITE_LIME_MARKET_PROGRAM_ID, VITE_LIME_VAULT_PROGRAM_ID, VITE_LIME_SETTLEMENT_PROGRAM_ID',
    );
  });
});
