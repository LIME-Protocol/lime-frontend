import { Link, useLocation } from 'react-router-dom';
import { Compass, Briefcase, BarChart3, Shield, Citrus, LogIn, LogOut, Sun, Moon, BookOpen, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/hooks/use-theme';
import { useBalances } from '@/hooks/use-wallet';

interface NavItemDef {
  label: string;
  path: string;
  icon: typeof Compass;
  secondary?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Explore', path: '/', icon: Compass },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
  { label: 'Resolved', path: '/resolved', icon: BarChart3 },
  { label: 'Bookbuilding', path: '/bookbuilding', icon: BookOpen, secondary: true },
  { label: 'Admin', path: '/admin', icon: Shield, secondary: true },
];

function NavItem({ item, active }: { item: NavItemDef; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-primary/10 text-primary'
          : item.secondary
            ? 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
    >
      <Icon className={cn('h-4 w-4', item.secondary && !active && 'opacity-60')} />
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNavItem({ item, active }: { item: typeof NAV_ITEMS[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{item.label}</span>
    </Link>
  );
}

function BalanceIndicator() {
  const { data: balances = [] } = useBalances();
  const usdBalance = balances.find((b: any) => b.currency === 'USD');
  const totalUsd = usdBalance ? Number(usdBalance.amount) : 0;

  if (totalUsd <= 0) return null;

  return (
    <Link
      to="/wallet"
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/80 text-[11px] font-mono font-semibold text-foreground hover:bg-secondary transition-colors"
    >
      <Wallet className="h-3 w-3 text-primary" />
      ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </Link>
  );
}

function UserActions() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { theme, toggle } = useTheme();

  return (
    <div className="flex items-center gap-2 ml-auto">
      {user && <BalanceIndicator />}
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:inline truncate max-w-[140px]">
            {user.email}
          </span>
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
  );
}

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-14 gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Citrus className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight leading-tight">LIME</span>
            <span className="text-[8px] font-medium text-muted-foreground leading-none tracking-widest uppercase">
              Linear Index Market Exchange
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} active={pathname === item.path} />
          ))}
        </nav>

        <UserActions />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.path} item={item} active={pathname === item.path} />
        ))}
      </div>
    </header>
  );
}
