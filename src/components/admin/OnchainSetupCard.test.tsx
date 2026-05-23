import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OnchainSetupCard from './OnchainSetupCard';

const initializeMarketProtocol = vi.fn().mockResolvedValue('market-tx');
const initializeSettlementProtocol = vi.fn().mockResolvedValue('settlement-tx');

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: { toBase58: () => 'AdminWallet111111111111111111111111111111111' },
  }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: vi.fn() }),
}));

vi.mock('@/hooks/use-lime-sdk', () => ({
  useLimeSdk: () => ({
    market: { initializeProtocol: initializeMarketProtocol },
    settlement: { initializeProtocol: initializeSettlementProtocol },
  }),
}));

describe('OnchainSetupCard', () => {
  it('initializes market and settlement protocol config accounts with the connected admin wallet', async () => {
    render(<OnchainSetupCard />);

    fireEvent.click(screen.getByRole('button', { name: /initialize protocols/i }));

    await waitFor(() => {
      expect(initializeMarketProtocol).toHaveBeenCalled();
      expect(initializeSettlementProtocol).toHaveBeenCalledWith('AdminWallet111111111111111111111111111111111');
    });
  });
});
