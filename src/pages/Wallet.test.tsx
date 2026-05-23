import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WalletPage from './Wallet';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, loading: false }),
}));

vi.mock('@/hooks/use-wallet-summary', () => ({
  useWalletSummary: () => ({
    data: {
      available: 100,
      reserved: 0,
      total: 100,
      lifetime_pnl: 0,
    },
    isLoading: false,
  }),
}));

const mutateAsync = vi.fn();

vi.mock('@/hooks/use-wallet', () => ({
  useDeposit: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('@/components/wallet/SimulationBanner', () => ({
  default: () => <div>Simulation mode</div>,
}));

vi.mock('@/components/wallet/WithdrawForm', () => ({
  default: () => <div>Withdraw form</div>,
}));

vi.mock('@/components/wallet/ActivityFeed', () => ({
  default: () => <div>Activity feed</div>,
}));

describe('WalletPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it('does not expose generic crypto address deposit methods in the MVP wallet', () => {
    render(
      <MemoryRouter>
        <WalletPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /credit \/ debit card/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bank wire/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pix/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /usdc/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /bitcoin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ethereum/i })).not.toBeInTheDocument();
  });
});
