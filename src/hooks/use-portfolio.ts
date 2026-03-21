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

      const { data: buyTrades } = await supabase
        .from('trades')
        .select('*, markets(title)')
        .eq('buyer_user_id', session.user.id)
        .order('executed_at', { ascending: false })
        .limit(25);

      const { data: sellTrades } = await supabase
        .from('trades')
        .select('*, markets(title)')
        .eq('seller_user_id', session.user.id)
        .order('executed_at', { ascending: false })
        .limit(25);

      const all = [...(buyTrades || []), ...(sellTrades || [])];
      all.sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime());
      return all.slice(0, 50);
    },
  });
}
