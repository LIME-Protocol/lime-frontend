import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type DbMarket = Tables<'markets'>;

export function useMarkets(status?: string) {
  return useQuery({
    queryKey: ['markets', status],
    queryFn: async () => {
      let query = supabase.from('markets').select('*').order('created_at', { ascending: false });
      if (status) {
        query = query.eq('status', status as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as DbMarket[];
    },
  });
}

export function useMarket(id: string | undefined) {
  return useQuery({
    queryKey: ['market', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DbMarket;
    },
    enabled: !!id,
  });
}

export function useMarketTrades(marketId: string | undefined) {
  return useQuery({
    queryKey: ['trades', marketId],
    queryFn: async () => {
      if (!marketId) return [];
      const { data, error } = await supabase
        .from('public_trades')
        .select('*')
        .eq('market_id', marketId)
        .order('executed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!marketId,
    staleTime: 5_000,
  });
}

export function useMarketOrders(marketId: string | undefined) {
  return useQuery({
    queryKey: ['market-orders', marketId],
    queryFn: async () => {
      if (!marketId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('market_id', marketId)
        .in('status', ['open', 'partial'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!marketId,
    staleTime: 5_000,
  });
}
