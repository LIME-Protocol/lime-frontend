import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Trade } from '@/lib/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Live recent trades for a market, with realtime subscription.
 * Trades from the matching engine are agnostic to taker side, so we
 * surface them as plain executions; UI may color them by price drift.
 */
export function useMarketTradesLive(marketId: string | undefined, limit = 30) {
  const queryClient = useQueryClient();
  const isUuid = !!marketId && UUID_RE.test(marketId);

  const query = useQuery({
    queryKey: ['market-trades-live', marketId, limit],
    queryFn: async (): Promise<Trade[]> => {
      if (!isUuid) return [];
      const { data, error } = await supabase
        .from('trades')
        .select('id, market_id, price, quantity, executed_at')
        .eq('market_id', marketId!)
        .order('executed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((t) => ({
        id: t.id,
        marketId: t.market_id,
        side: 'buy' as const, // executions are sideless; default to buy for badge color
        price: Number(t.price),
        quantity: Number(t.quantity),
        timestamp: t.executed_at,
      }));
    },
    enabled: isUuid,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (!isUuid) return;
    const channel = supabase
      .channel(`trades:${marketId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trades', filter: `market_id=eq.${marketId}` },
        () => queryClient.invalidateQueries({ queryKey: ['market-trades-live', marketId, limit] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId, isUuid, limit, queryClient]);

  return query;
}
