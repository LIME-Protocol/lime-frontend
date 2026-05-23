import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketRange, PayoffCurve } from '@/lib/types';

/** UUID v4 pattern check */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useMarketRanges(marketId: string | undefined) {
  return useQuery({
    queryKey: ['market-ranges', marketId],
    queryFn: async (): Promise<MarketRange[]> => {
      if (!marketId) return [];

      if (!UUID_RE.test(marketId)) return [];

      const { data, error } = await supabase
        .from('market_ranges')
        .select('*')
        .eq('market_id', marketId)
        .order('lower_bound', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: r.id,
        marketId: r.market_id,
        label: r.label,
        lowerBound: Number(r.lower_bound),
        upperBound: Number(r.upper_bound),
        status: r.status as 'active' | 'preliminary',
        currentPrice: Number(r.current_price),
        volume24h: Number(r.volume_24h),
        totalVolume: Number(r.total_volume),
        openInterest: Number(r.open_interest),
        payoffCurve: r.payoff_curve as PayoffCurve | undefined,
      }));
    },
    enabled: !!marketId,
  });
}
