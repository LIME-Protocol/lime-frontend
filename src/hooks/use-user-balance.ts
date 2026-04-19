import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

/**
 * Returns the USD balance row for the current user (or null if none yet).
 */
export function useUserBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['balance-usd', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('balances')
        .select('amount, currency')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .maybeSingle();
      if (error) throw error;
      return data ? { amount: Number(data.amount), currency: data.currency } : { amount: 0, currency: 'USD' };
    },
    enabled: !!user,
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
}
