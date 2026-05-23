import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ApproveButton from './ApproveButton';

const mocks = vi.hoisted(() => ({
  activateMarket: vi.fn().mockResolvedValue('activate-tx'),
  update: vi.fn(),
  eq: vi.fn().mockResolvedValue({ error: null }),
  invalidateQueries: vi.fn(),
}));

vi.mock('@/hooks/use-lime-sdk', () => ({
  useLimeSdk: () => ({
    market: { activateMarket: mocks.activateMarket },
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      update: mocks.update.mockReturnValue({ eq: mocks.eq }),
    }),
  },
}));

describe('ApproveButton', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockClear());
    mocks.eq.mockResolvedValue({ error: null });
  });

  it('activates the linked on-chain Program market before marking the market active', async () => {
    render(
      <ApproveButton
        marketId="market-1"
        onchainMarketId={1_779_552_000_123}
        queryClient={{ invalidateQueries: mocks.invalidateQueries } as never}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() => {
      expect(mocks.activateMarket).toHaveBeenCalledWith(1_779_552_000_123n);
      expect(mocks.update).toHaveBeenCalledWith({ status: 'active' });
      expect(mocks.eq).toHaveBeenCalledWith('id', 'market-1');
    });
  });
});
