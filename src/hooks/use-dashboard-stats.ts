import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  activeMarkets: number;
  totalVolume24h: number;
  totalOpenInterest: number;
  resolved24h: number;
  closingSoonId: string | null;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;

      const raw = data as Record<string, unknown>;
      return {
        activeMarkets: Number(raw.active_markets ?? 0),
        totalVolume24h: Number(raw.total_volume_24h ?? 0),
        totalOpenInterest: Number(raw.total_open_interest ?? 0),
        resolved24h: Number(raw.resolved_24h ?? 0),
        closingSoonId: (raw.closing_soon_id as string) ?? null,
      };
    },
    refetchInterval: 30_000,
  });
}
