import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLimeSdk } from '@/hooks/use-lime-sdk';
import type { PositionSide } from '@/services/wallet';

function requireMarket(onchainMarketId?: string) {
  if (!onchainMarketId) {
    throw new Error('This Market is not linked to an on-chain Program market yet.');
  }
  return onchainMarketId;
}

function requireSdk<T>(sdk: T | null) {
  if (!sdk) {
    throw new Error('Connect your wallet to use on-chain Market actions.');
  }
  return sdk;
}

export function useMarketAvailableCollateral(onchainMarketId?: string) {
  const sdk = useLimeSdk();

  return useQuery({
    queryKey: ['market-collateral', onchainMarketId],
    queryFn: async () => {
      const services = requireSdk(sdk);
      return services.collateral.getLockedBalance(requireMarket(onchainMarketId));
    },
    enabled: Boolean(sdk && onchainMarketId),
    staleTime: 10_000,
  });
}

export function useDepositCollateral(onchainMarketId?: string) {
  const sdk = useLimeSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const services = requireSdk(sdk);
      const collateral = services.collateral as typeof services.collateral & {
        depositCollateral?: (marketId: string, amount: number) => Promise<string>;
      };
      const marketId = requireMarket(onchainMarketId);
      const deposit = collateral.depositCollateral ?? collateral.lockCollateral;
      return deposit.call(collateral, marketId, amount);
    },
    onSuccess: () => {
      toast.success('Collateral deposited.');
      queryClient.invalidateQueries({ queryKey: ['market-collateral', onchainMarketId] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to deposit collateral'),
  });
}

export function useWithdrawAvailableCollateral(onchainMarketId?: string) {
  const sdk = useLimeSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const services = requireSdk(sdk);
      const collateral = services.collateral as typeof services.collateral & {
        withdrawAvailableCollateral?: (marketId: string, amount: number) => Promise<string>;
      };
      const marketId = requireMarket(onchainMarketId);
      const withdraw = collateral.withdrawAvailableCollateral ?? collateral.releaseCollateral;
      return withdraw.call(collateral, marketId, amount);
    },
    onSuccess: () => {
      toast.success('Available Collateral withdrawn.');
      queryClient.invalidateQueries({ queryKey: ['market-collateral', onchainMarketId] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to withdraw collateral'),
  });
}

export function usePayoutStatus(onchainMarketId?: string, side: PositionSide = 'long') {
  const sdk = useLimeSdk();

  return useQuery({
    queryKey: ['payout-status', onchainMarketId, side],
    queryFn: async () => requireSdk(sdk).settlement.getPayoutStatus(requireMarket(onchainMarketId), side),
    enabled: Boolean(sdk && onchainMarketId),
  });
}

export function useClaimPayout(onchainMarketId?: string) {
  const sdk = useLimeSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (side: PositionSide) => requireSdk(sdk).settlement.claimPayout(requireMarket(onchainMarketId), side),
    onSuccess: () => {
      toast.success('Payout claim submitted.');
      queryClient.invalidateQueries({ queryKey: ['payout-status', onchainMarketId] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to claim payout'),
  });
}

export function useRefundIfCancelled(onchainMarketId?: string) {
  const sdk = useLimeSdk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (side: PositionSide) => requireSdk(sdk).settlement.refundIfInvalidated(requireMarket(onchainMarketId), side),
    onSuccess: () => {
      toast.success('Refund submitted.');
      queryClient.invalidateQueries({ queryKey: ['payout-status', onchainMarketId] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to request refund'),
  });
}
