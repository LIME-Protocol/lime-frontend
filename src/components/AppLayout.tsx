import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Briefcase, Compass, Plus, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Explorar', path: '/', icon: Compass },
  { label: 'Portfólio', path: '/portfolio', icon: Briefcase },
  { label: 'Resolvidos', path: '/resolved', icon: BarChart3 },
  { label: 'Admin', path: '/admin', icon: Settings },
];

function NavItem({ item }: { item: typeof navItems[0] }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-sidebar-accent-foreground tracking-tight">
            Quantis
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-sidebar-foreground/40 px-4">
            Quantis MVP v0.1
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="font-semibold text-sm">Quantis</span>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex border-b bg-card overflow-x-auto">
          {navItems.map((item) => {
            const { pathname } = useLocation();
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
