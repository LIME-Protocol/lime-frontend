import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrderBook } from '@/lib/types';

interface OrderRow {
  price: number;
  side: 'buy' | 'sell';
  quantity: number;
  filled_quantity: number;
  status: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function aggregate(rows: OrderRow[]): OrderBook {
  const open = rows.filter((o) => o.status === 'open' || o.status === 'partial');

  const buildSide = (side: 'buy' | 'sell') => {
    const map = new Map<number, number>();
    open.filter((o) => o.side === side).forEach((o) => {
      const remaining = Number(o.quantity) - Number(o.filled_quantity);
      if (remaining <= 0) return;
      const p = Number(o.price);
      map.set(p, (map.get(p) ?? 0) + remaining);
    });
    const levels = Array.from(map.entries())
      .map(([price, size]) => ({ price, size }))
      .sort((a, b) => (side === 'buy' ? b.price - a.price : a.price - b.price))
      .slice(0, 12);
    let cum = 0;
    return levels.map((l) => ({ ...l, total: (cum += l.size) }));
  };

  const bids = buildSide('buy');
  const asks = buildSide('sell');
  const spread =
    asks.length && bids.length ? Number((asks[0].price - bids[0].price).toFixed(3)) : 0;

  return { bids, asks, spread };
}

/**
 * Live order book aggregated from the `orders` table.
 * Subscribes to realtime changes for the given market.
 */
export function useOrderBook(marketId: string | undefined) {
  const queryClient = useQueryClient();
  const isUuid = !!marketId && UUID_RE.test(marketId);

  const query = useQuery({
    queryKey: ['order-book', marketId],
    queryFn: async (): Promise<OrderBook> => {
      if (!isUuid) return { bids: [], asks: [], spread: 0 };
      const { data, error } = await supabase
        .from('orders')
        .select('price, side, quantity, filled_quantity, status')
        .eq('market_id', marketId!)
        .in('status', ['open', 'partial']);
      if (error) throw error;
      return aggregate((data ?? []) as OrderRow[]);
    },
    enabled: isUuid,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (!isUuid) return;
    const channel = supabase.channel(`orderbook:${marketId}:${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `market_id=eq.${marketId}` },
        () => queryClient.invalidateQueries({ queryKey: ['order-book', marketId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId, isUuid, queryClient]);

  return query;
}
