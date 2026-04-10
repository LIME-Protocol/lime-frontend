import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { markets as mockMarkets, marketRanges } from '@/lib/mock-data';
import type { Market } from '@/lib/types';
import { daysUntil } from '@/lib/types';

export interface DashboardStats {
  activeMarkets: number;
  totalVolume24h: number;
  openPositionsValue: number;
  openPositionsCount: number;
  closing24h: number;
}

/** Compute stats from mock data as fallback when DB has no activity */
function computeMockStats(allMarkets: Market[]): DashboardStats {
  const active = allMarkets.filter(m => m.status === 'active');
  return {
    activeMarkets: active.length,
    totalVolume24h: active.reduce((sum, m) => sum + m.volume24h, 0),
    openPositionsValue: active.reduce((sum, m) => sum + m.openInterest, 0),
    openPositionsCount: active.length,
    closing24h: active.filter(m => {
      const d = daysUntil(m.resolutionDate);
      return d <= 1;
    }).length,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;

      const raw = data as Record<string, unknown>;
      const dbStats: DashboardStats = {
        activeMarkets: Number(raw.active_markets ?? 0),
        totalVolume24h: Number(raw.total_volume_24h ?? 0),
        openPositionsValue: Number(raw.open_positions_value ?? 0),
        openPositionsCount: Number(raw.open_positions_count ?? 0),
        closing24h: Number(raw.closing_24h ?? 0),
      };

      // If DB has real activity, use it; otherwise enrich with mock data
      const hasRealActivity = dbStats.totalVolume24h > 0 || dbStats.openPositionsCount > 0;
      if (hasRealActivity) return dbStats;

      const mockStats = computeMockStats(mockMarkets);
      return {
        activeMarkets: Math.max(dbStats.activeMarkets, mockStats.activeMarkets),
        totalVolume24h: mockStats.totalVolume24h,
        openPositionsValue: mockStats.openPositionsValue,
        openPositionsCount: mockStats.openPositionsCount,
        closing24h: Math.max(dbStats.closing24h, mockStats.closing24h),
      };
    },
    refetchInterval: 30_000,
  });
}
