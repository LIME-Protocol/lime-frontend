import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  BarChart3,
  Shield,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { label: 'Explore', path: '/', icon: Compass },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Resolved', path: '/resolved', icon: BarChart3 },
  { label: 'Admin', path: '/admin', icon: Shield },
];

function NavItem({ item, collapsed }: { item: typeof navItems[0]; collapsed?: boolean }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-[hsl(var(--sidebar-muted))] hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-sidebar shrink-0 border-r border-sidebar-border">
        <div className="px-4 py-4 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-[15px] font-bold text-sidebar-accent-foreground tracking-tight">
            RangeX
          </span>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))]/60 font-mono">
            RangeX v0.1 — MVP
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-sidebar flex flex-col animate-reveal-left">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="text-[15px] font-bold text-sidebar-accent-foreground">RangeX</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-1 space-y-0.5">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b bg-card shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="font-semibold text-sm">RangeX</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
