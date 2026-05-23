import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Admin from './Admin';

let markets: Array<Record<string, unknown>> = [];

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 'admin-1' }, loading: false }),
}));

vi.mock('@/hooks/use-user-role', () => ({
  useHasRole: () => ({ hasRole: true, isLoading: false }),
}));

vi.mock('@/hooks/use-markets', () => ({
  useMarkets: () => ({ data: markets }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useQuery: () => ({ data: [] }),
  };
});

vi.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({ connection: {} }),
  useWallet: () => ({ publicKey: null }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: vi.fn() }),
}));

vi.mock('@/hooks/use-lime-sdk', () => ({
  useLimeSdk: () => null,
}));

describe('Admin', () => {
  beforeEach(() => {
    markets = [];
  });

  it('shows on-chain protocol setup before market management', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /admin panel/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /on-chain setup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /initialize protocols|connect admin wallet/i })).toBeInTheDocument();
  });

  it('requires draft markets to be initialized on-chain before approval', () => {
    markets = [{
      id: 'market-1',
      title: 'Bitcoin — Mid 2026',
      category: 'Crypto',
      status: 'draft',
      lower_bound: 80_000,
      upper_bound: 140_000,
      unit: 'USD',
      resolution_date: '2026-06-30T00:00:00.000Z',
      final_observed_value: null,
      onchain_market_id: null,
    }];

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /bitcoin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /initialize on-chain|connect wallet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve/i })).toBeDisabled();
  });
});
