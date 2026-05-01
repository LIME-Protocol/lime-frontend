import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface SavedDestination {
  id: string;
  method: string;
  label: string;
  destination: string;
  last_used_at: string;
}

export function useSavedDestinations(method?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['withdrawal-destinations', user?.id, method ?? 'all'],
    queryFn: async (): Promise<SavedDestination[]> => {
      if (!user) return [];
      let q = supabase
        .from('withdrawal_destinations')
        .select('id, method, label, destination, last_used_at')
        .order('last_used_at', { ascending: false })
        .limit(10);
      if (method) q = q.eq('method', method);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useSaveDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { method: string; label: string; destination: string }) => {
      const { data, error } = await supabase.rpc('upsert_withdrawal_destination', {
        p_method: params.method,
        p_label: params.label,
        p_destination: params.destination,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withdrawal-destinations'] }),
  });
}

export function useDeleteDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('withdrawal_destinations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withdrawal-destinations'] }),
  });
}
