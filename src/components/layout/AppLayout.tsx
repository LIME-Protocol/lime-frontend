import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Navbar from './Navbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Public marketing redirect: unauthenticated visitors on the app root
  // are sent to the landing page. All other routes remain reachable.
  if (!loading && !user && location.pathname === '/') {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
