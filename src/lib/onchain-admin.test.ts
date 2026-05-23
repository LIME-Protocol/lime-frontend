// @vitest-environment node

import { PublicKey } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';

import {
  buildOnchainMarketInput,
  deriveVaultTokenAccount,
  generateOnchainMarketId,
} from './onchain-admin';

describe('on-chain admin market setup', () => {
  it('builds a Program market input from the visible market configuration', () => {
    const input = buildOnchainMarketInput({
      marketId: generateOnchainMarketId(1_779_552_000_123),
      lowerBound: 80_000.2,
      upperBound: 140_000.7,
      resolutionDate: '2026-06-30T00:00:00.000Z',
      settlementSource: 'CoinMarketCap BTC/USD close',
    });

    expect(input).toEqual({
      marketId: 1_779_552_000_123n,
      lowerBound: 80_000n,
      upperBound: 140_001n,
      resolutionTs: 1_782_777_600n,
      settlementSource: 'CoinMarketCap BTC/USD close',
      minParticipants: 1,
    });
  });

  it('derives the USDC vault token account from the market id and vault program', () => {
    const result = deriveVaultTokenAccount({
      marketId: 1_779_552_000_123n,
      usdcMint: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
      vaultProgramId: new PublicKey('73C6Qi25C8owQGRKgrvfDkTXKLgyawSC5MXwAGHj7iMZ'),
    });

    expect(result.vaultAuthority.toBase58()).toBe('Aeas5UAKk7kYeqcMF8pnb5uNWJF1kLEF54UWHto6Nk5i');
    expect(result.vaultTokenAccount.toBase58()).toBe('Mu37DTx9r3hTSktPG7nQHgBU46HnZUWoLGQJmgZTZYs');
  });
});
