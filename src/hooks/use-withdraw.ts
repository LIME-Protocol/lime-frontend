import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type WithdrawMethod = 'PIX' | 'USDC' | 'BTC' | 'ETH' | 'WIRE';

export interface WithdrawParams {
  amount: number;
  currency: string;
  method: WithdrawMethod;
  destination: string;
}

/**
 * Request a withdrawal. The DB function locks the balance row,
 * validates available funds, debits, and inserts a `pending` transaction
 * atomically. Admins approve/reject from the Admin panel.
 */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: WithdrawParams) => {
      const { data, error } = await supabase.rpc('request_withdrawal', {
        p_amount: params.amount,
        p_currency: params.currency,
        p_method: params.method,
        p_destination: params.destination,
      });
      if (error) throw error;
      const result = data as { success?: boolean; error?: string; available?: number };
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance-usd'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['unified-activity'] });
    },
  });
}
