import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBalances() {
  return useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data, error } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', session.user.id);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { method: string; amount: number; currency: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in');

      // Create transaction record
      const { error: txErr } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        type: 'deposit',
        method: params.method,
        currency: params.currency,
        amount: params.amount,
        status: 'confirmed', // MVP: auto-confirm
      });
      if (txErr) throw txErr;

      // Upsert balance
      const { data: existing } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', session.user.id)
        .eq('currency', params.currency)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('balances')
          .update({ amount: Number(existing.amount) + params.amount })
          .eq('user_id', session.user.id)
          .eq('currency', params.currency);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('balances')
          .insert({ user_id: session.user.id, currency: params.currency, amount: params.amount });
        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
