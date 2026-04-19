import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Cancels an open or partially-filled order owned by the current user.
 * Backed by the `cancel_order` SECURITY DEFINER RPC, which enforces
 * ownership and valid status transitions server-side.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.rpc('cancel_order', { p_order_id: orderId });
      if (error) throw error;
      const result = data as { success?: boolean; error?: string; order_id?: string };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['market-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-book'] });
      queryClient.invalidateQueries({ queryKey: ['balance-usd'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
}
