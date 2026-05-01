import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCancelWithdrawal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (txId: string) => {
      const { data, error } = await supabase.rpc('cancel_withdrawal', { p_tx_id: txId });
      if (error) throw error;
      const r = data as { success?: boolean; error?: string; refunded?: number };
      if (r?.error) throw new Error(r.error);
      return r;
    },
    onSuccess: (r) => {
      toast.success(`Withdrawal cancelled — $${Number(r?.refunded ?? 0).toFixed(2)} refunded`);
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['balances'] });
      qc.invalidateQueries({ queryKey: ['balance-usd'] });
      qc.invalidateQueries({ queryKey: ['wallet-summary'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Failed to cancel withdrawal'),
  });
}
