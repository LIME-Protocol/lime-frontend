import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface WalletSummary {
  available: number;
  reserved: number;
  total: number;
  lifetime_pnl: number;
  pending_withdraw: number;
  withdrawn_today: number;
  daily_limit: number;
  daily_remaining: number;
}

const EMPTY: WalletSummary = {
  available: 0,
  reserved: 0,
  total: 0,
  lifetime_pnl: 0,
  pending_withdraw: 0,
  withdrawn_today: 0,
  daily_limit: 10000,
  daily_remaining: 10000,
};

export function useWalletSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet-summary', user?.id],
    queryFn: async (): Promise<WalletSummary> => {
      if (!user) return EMPTY;
      const { data, error } = await supabase.rpc('get_wallet_summary');
      if (error) throw error;
      const r = data as Record<string, number> & { error?: string };
      if (r?.error) return EMPTY;
      return {
        available: Number(r.available ?? 0),
        reserved: Number(r.reserved ?? 0),
        total: Number(r.total ?? 0),
        lifetime_pnl: Number(r.lifetime_pnl ?? 0),
        pending_withdraw: Number(r.pending_withdraw ?? 0),
        withdrawn_today: Number(r.withdrawn_today ?? 0),
        daily_limit: Number(r.daily_limit ?? 10000),
        daily_remaining: Number(r.daily_remaining ?? 10000),
      };
    },
    enabled: !!user,
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
}
