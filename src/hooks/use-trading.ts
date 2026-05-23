import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isUuid } from '@/lib/uuid';
import {
  buildLimitOrderDraft,
  serializeLimitOrderMessage,
  type OrderAction,
} from '@/lib/signed-orders';
import { orderSubmissionClient } from '@/services/order-submission';
import { isMatchingEngineConfigured } from '@/services/order-submission';
import { useSolanaWalletProvider } from '@/hooks/use-solana-wallet-provider';

interface PlaceOrderParams {
  market_id: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit';
  quantity: number;
  price: number;
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!isUuid(params.market_id)) {
        throw new Error('This is a demo market and is not available for trading yet.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to trade');

      // Direct RPC call — auth enforced via auth.uid() inside the function.
      const { data, error } = await supabase.rpc('place_order_and_match', {
        p_user_id: user.id,
        p_market_id: params.market_id,
        p_side: params.side,
        p_order_type: params.order_type,
        p_quantity: params.quantity,
        p_price: params.price,
      });

      if (error) {
        // Friendlier message for the common UUID/missing market case
        if (/uuid/i.test(error.message)) {
          throw new Error('This market is not available for trading yet.');
        }
        throw error;
      }
      const result = data as { error?: string; status?: string; filled?: number };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      const filled = data.filled || 0;
      const status = data.status;

      if (status === 'filled') {
        toast.success(`Order filled — ${filled} contracts at ${(variables.price * 100).toFixed(1)}¢`);
      } else if (status === 'partial') {
        toast.success(`Partially filled — ${filled}/${variables.quantity} contracts`);
      } else if (status === 'open') {
        toast.info('Order placed — waiting for match');
      } else if (status === 'cancelled') {
        toast.warning('Market order — no matching orders available');
      }

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['trades', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['market-trades-live', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['order-book', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['market-orders', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['market', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['balance-usd'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['unified-activity'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
}

interface SubmitSignedLimitOrderParams {
  market_id: string;
  onchain_market_id?: string;
  action: OrderAction;
  quantity: number;
  limit_price: number;
  expiry_minutes: number;
}

function createNonce() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useSubmitSignedLimitOrder() {
  const queryClient = useQueryClient();
  const walletProvider = useSolanaWalletProvider();

  return useMutation({
    mutationFn: async (params: SubmitSignedLimitOrderParams) => {
      if (!isUuid(params.market_id)) {
        throw new Error('This is a demo market and is not available for trading yet.');
      }
      if (!params.onchain_market_id) {
        throw new Error('This Market is not linked to an on-chain Program market yet.');
      }
      if (!isMatchingEngineConfigured()) {
        throw new Error('Matching engine endpoint is not configured.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to trade');

      const owner = walletProvider.isConnected()
        ? walletProvider.getAddress()
        : await walletProvider.connect();

      if (!owner) throw new Error('Connect your wallet to sign this order.');

      const draft = buildLimitOrderDraft({
        marketId: params.onchain_market_id,
        owner,
        action: params.action,
        quantity: params.quantity,
        limitPrice: params.limit_price,
        expiryTs: Math.floor(Date.now() / 1000) + params.expiry_minutes * 60,
        nonce: createNonce(),
        chainId: walletProvider.getChain(),
      });
      const message = serializeLimitOrderMessage(draft);
      const signature = await walletProvider.signMessage(message);

      return orderSubmissionClient.submitSignedLimitOrder({
        payload: draft,
        message,
        signature,
      });
    },
    onSuccess: (data, variables) => {
      if (data.status === 'accepted') {
        toast.success('Signed limit order submitted to the matching engine.');
      } else if (data.status === 'signed') {
        toast.info('Limit order signed. Matching engine submission is not configured yet.');
      } else {
        toast.error(data.reason ?? 'Matching engine rejected the signed order.');
      }

      queryClient.invalidateQueries({ queryKey: ['order-book', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['market-orders', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign limit order');
    },
  });
}
