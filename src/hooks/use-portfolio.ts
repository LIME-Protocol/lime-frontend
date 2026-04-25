import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('positions')
        .select('*, markets(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'open')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useUserOrders() {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*, markets(title)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useUserTrades() {
  return useQuery({
    queryKey: ['user-trades'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // Use SECURITY DEFINER RPC: returns only the caller's own trades
      // with side derived server-side. Identifier columns are otherwise
      // ungranted on the trades table.
      const { data, error } = await supabase.rpc('get_my_trades', {
        p_market_id: undefined,
        p_limit: 50,
      });
      if (error) throw error;

      // Hydrate market titles in a single query
      const ids = Array.from(new Set((data ?? []).map((t: any) => t.market_id)));
      const titles: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: mkts } = await supabase
          .from('markets')
          .select('id, title')
          .in('id', ids);
        (mkts ?? []).forEach((m: any) => { titles[m.id] = m.title; });
      }
      return (data ?? []).map((t: any) => ({ ...t, markets: { title: titles[t.market_id] ?? '' } }));
    },
  });
}
