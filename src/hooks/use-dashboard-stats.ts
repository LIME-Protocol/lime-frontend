import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  activeMarkets: number;
  totalVolume24h: number;
  openPositionsValue: number;
  openPositionsCount: number;
  closing24h: number;
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

      return dbStats;
    },
    refetchInterval: 30_000,
  });
}
