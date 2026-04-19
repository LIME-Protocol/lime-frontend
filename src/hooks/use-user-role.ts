import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type AppRole = 'admin' | 'moderator' | 'user';

/**
 * Returns the set of roles for the current user.
 * Roles live in the `user_roles` table — never on profiles.
 */
export function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<AppRole[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/** Convenience: does the current user have a given role? */
export function useHasRole(role: AppRole) {
  const { data: roles = [], isLoading } = useUserRoles();
  return { hasRole: roles.includes(role), isLoading };
}
