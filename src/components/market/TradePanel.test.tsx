import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import TradePanel from './TradePanel';
import type { Market } from '@/lib/types';

let authUser: null | { id: string } = null;
const mutate = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: authUser }),
}));

vi.mock('@/hooks/use-user-balance', () => ({
  useUserBalance: () => ({ data: { amount: 100, currency: 'USD' } }),
}));

vi.mock('@/hooks/use-trading', () => ({
  useSubmitSignedLimitOrder: () => ({ mutate, isPending: false }),
}));

vi.mock('@/services/order-submission', () => ({
  isMatchingEngineConfigured: () => true,
}));

const market: Market = {
  id: '11111111-1111-4111-8111-111111111111',
  onchainMarketId: '1',
  title: 'Fed Funds Market',
  description: 'A test market',
  category: 'Rates',
  variable: 'Fed Funds',
  unit: '%',
  lowerBound: 3,
  upperBound: 6,
  resolutionDate: '2026-12-31',
  settlementSource: 'Federal Reserve',
  status: 'active',
  currentPrice: 0.42,
  volume24h: 1000,
  totalVolume: 5000,
  openInterest: 3000,
  createdAt: '2026-01-01',
};

describe('TradePanel', () => {
  beforeEach(() => {
    authUser = null;
    mutate.mockClear();
  });

  it('renders the MVP limit order flow without market order controls', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <TradePanel market={market} />
        </TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Limit Order' })).toBeInTheDocument();
    expect(screen.getByLabelText('Position Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Limit Price (cents)')).toBeInTheDocument();
    expect(screen.getByLabelText('Order Expiration (minutes)')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Market' })).not.toBeInTheDocument();
  });

  it('submits the on-chain market id for wallet-signed orders', () => {
    authUser = { id: 'user-1' };

    render(
      <MemoryRouter>
        <TooltipProvider>
          <TradePanel market={market} />
        </TooltipProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign buy limit order/i }));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      market_id: market.id,
      onchain_market_id: '1',
      action: 'buy',
    }));
  });
});
