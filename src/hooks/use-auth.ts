import { useAuthStore } from '@/stores/auth-store';

/**
 * Convenience hook wrapping the Zustand auth store.
 * No useEffect — state is managed globally via the store's subscription.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);

  return { user, session, loading, signIn, signUp, signOut };
}
