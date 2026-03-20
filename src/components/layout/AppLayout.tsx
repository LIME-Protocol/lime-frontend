import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Briefcase, BarChart3, Shield, TrendingUp, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Explore', path: '/', icon: Compass },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Resolved', path: '/resolved', icon: BarChart3 },
  { label: 'Admin', path: '/admin', icon: Shield },
];

function NavItem({ item }: { item: typeof navItems[0] }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-[hsl(var(--sidebar-muted))] hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60'
      )}
    >
      <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary')} />
      <span>{item.label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
    </Link>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-sidebar shrink-0 border-r border-sidebar-border">
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-bold text-sidebar-accent-foreground tracking-tight">
            RangeX
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-positive animate-pulse-glow" />
            <p className="text-[10px] text-[hsl(var(--sidebar-muted))] font-mono">
              Live · RangeX v0.1
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col animate-reveal-left border-r border-sidebar-border">
            <div className="px-4 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[15px] font-bold text-sidebar-accent-foreground">RangeX</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground p-1 hover:text-sidebar-accent-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-2 space-y-0.5">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-md hover:bg-secondary transition-colors active:scale-95">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">RangeX</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
