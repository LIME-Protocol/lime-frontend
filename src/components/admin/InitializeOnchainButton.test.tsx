import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import InitializeOnchainButton from './InitializeOnchainButton';
import type { DbMarket } from '@/hooks/use-markets';

const mocks = vi.hoisted(() => ({
  createMarket: vi.fn().mockResolvedValue('create-market-tx'),
  initMarketVault: vi.fn().mockResolvedValue('init-vault-tx'),
  initMarketSettlement: vi.fn().mockResolvedValue('init-settlement-tx'),
  ensureVaultTokenAccount: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  eq: vi.fn().mockResolvedValue({ error: null }),
  invalidateQueries: vi.fn(),
}));

vi.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({ connection: {} }),
  useWallet: () => ({
    publicKey: { toBase58: () => 'AdminWallet111111111111111111111111111111111' },
    signTransaction: vi.fn(),
    signAllTransactions: vi.fn(),
    signMessage: vi.fn(),
  }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: vi.fn() }),
}));

vi.mock('@/hooks/use-lime-sdk', () => ({
  useLimeSdk: () => ({
    market: { createMarket: mocks.createMarket },
    collateral: { initMarketVault: mocks.initMarketVault },
    settlement: { initMarketSettlement: mocks.initMarketSettlement },
  }),
}));

vi.mock('@/config/solana', () => ({
  solanaConfig: {
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    vaultProgramId: '73C6Qi25C8owQGRKgrvfDkTXKLgyawSC5MXwAGHj7iMZ',
  },
}));

vi.mock('@/lib/onchain-admin', async () => {
  const actual = await vi.importActual<typeof import('@/lib/onchain-admin')>('@/lib/onchain-admin');
  return {
    ...actual,
    generateOnchainMarketId: () => 1_779_552_000_123,
    deriveVaultTokenAccount: () => ({
      vaultAuthority: { toBase58: () => 'VaultAuthority11111111111111111111111111111' },
      vaultTokenAccount: { toBase58: () => 'VaultTokenAccount111111111111111111111111111' },
    }),
    ensureVaultTokenAccount: mocks.ensureVaultTokenAccount,
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      update: mocks.update.mockReturnValue({ eq: mocks.eq }),
    }),
  },
}));

const market = {
  id: 'market-1',
  title: 'Bitcoin — Mid 2026',
  lower_bound: 80_000,
  upper_bound: 140_000,
  resolution_date: '2026-06-30T00:00:00.000Z',
  settlement_source: 'CoinMarketCap BTC/USD close',
} as DbMarket;

describe('InitializeOnchainButton', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockClear());
    mocks.eq.mockResolvedValue({ error: null });
  });

  it('creates and links an on-chain Program market for an existing draft market', async () => {
    render(<InitializeOnchainButton market={market} queryClient={{ invalidateQueries: mocks.invalidateQueries } as never} />);

    fireEvent.click(screen.getByRole('button', { name: /initialize on-chain/i }));

    await waitFor(() => {
      expect(mocks.createMarket).toHaveBeenCalledWith(expect.objectContaining({
        marketId: 1_779_552_000_123n,
        lowerBound: 80_000n,
        upperBound: 140_000n,
      }));
      expect(mocks.ensureVaultTokenAccount).toHaveBeenCalled();
      expect(mocks.initMarketVault).toHaveBeenCalledWith('1779552000123', expect.any(String));
      expect(mocks.initMarketSettlement).toHaveBeenCalledWith('1779552000123');
      expect(mocks.update).toHaveBeenCalledWith({ onchain_market_id: 1_779_552_000_123 });
      expect(mocks.eq).toHaveBeenCalledWith('id', 'market-1');
    });
  });
});
