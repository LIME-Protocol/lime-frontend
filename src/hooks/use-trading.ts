import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isUuid } from '@/lib/uuid';

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
