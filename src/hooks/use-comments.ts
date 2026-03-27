import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string | null } | null;
}

export function useComments(marketId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['comments', marketId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('market_id', marketId)
        .order('created_at', { ascending: false })
        .limit(50);
      return (data as unknown as Comment[]) || [];
    },
  });

  // Realtime subscription — valid useEffect (external system)
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${marketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `market_id=eq.${marketId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', marketId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [marketId, queryClient]);

  return query;
}

export function usePostComment(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Please sign in');

      const { error } = await supabase.from('comments').insert({
        market_id: marketId,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] });
    },
  });
}
