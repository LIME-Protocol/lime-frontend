import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Briefcase, BarChart3, Shield, Citrus, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const navItems = [
  { label: 'Explore', path: '/', icon: Compass },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Resolved', path: '/resolved', icon: BarChart3 },
  { label: 'Admin', path: '/admin', icon: Shield },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-14 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Citrus className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight leading-tight">LIME</span>
              <span className="text-[8px] font-medium text-muted-foreground leading-none tracking-widest uppercase">Linear Index Market Exchange</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground hidden sm:inline truncate max-w-[140px]">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
