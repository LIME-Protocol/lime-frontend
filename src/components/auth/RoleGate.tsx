import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useHasRole, type AppRole } from '@/hooks/use-user-role';

interface RoleGateProps {
  role: AppRole;
  children: ReactNode;
  /** Where to redirect unauthenticated users. Default: /auth */
  redirectTo?: string;
  /** Custom fallback when authenticated but lacking the role. */
  fallback?: ReactNode;
  /** Optional redirect for authenticated users who do not hold the role. */
  unauthorizedRedirectTo?: string;
}

/**
 * Protects a subtree by requiring the current user to hold a specific role.
 * - Unauthenticated → redirect to `redirectTo`.
 * - Authenticated without role → fallback (default: friendly access denied).
 */
export default function RoleGate({ role, children, redirectTo = '/auth', fallback, unauthorizedRedirectTo }: RoleGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: roleLoading } = useHasRole(role);

  if (authLoading || roleLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  if (!hasRole) {
    if (unauthorizedRedirectTo) return <Navigate to={unauthorizedRedirectTo} replace />;

    return (
      fallback ?? (
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You need the <span className="font-mono">{role}</span> role to view this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
