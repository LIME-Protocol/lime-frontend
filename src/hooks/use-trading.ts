import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to trade');

      const { data, error } = await supabase.functions.invoke('place-order', {
        body: params,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
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
      queryClient.invalidateQueries({ queryKey: ['market-orders', variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['market', variables.market_id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
}
