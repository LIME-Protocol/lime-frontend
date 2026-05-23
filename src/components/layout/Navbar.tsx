import { useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, Briefcase, BarChart3, Shield, LogIn, LogOut, Sun, Moon,
  BookOpen, Wallet, Info, Search, X, ChevronDown, User,
} from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import logoFull from '@/assets/logo-full.png';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/hooks/use-theme';
import { useBalances } from '@/hooks/use-wallet';
import { categoryConfig } from '@/lib/categories';
import { useMarkets } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import NotificationBell from '@/components/layout/NotificationBell';

/* ── Types ── */
interface NavItemDef {
  label: string;
  path: string;
  icon: typeof Compass;
}

/* ── Primary nav (always visible) ── */
const PRIMARY_NAV: NavItemDef[] = [
  { label: 'Explore', path: '/app', icon: Compass },
  { label: 'Resolved', path: '/resolved', icon: BarChart3 },
  { label: 'Bookbuilding', path: '/bookbuilding', icon: BookOpen },
  { label: 'About', path: '/about', icon: Info },
];

/* ── Account dropdown items ── */
const ACCOUNT_NAV: NavItemDef[] = [
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
  { label: 'Control Panel', path: '/admin', icon: Shield },
];

/* ── Sub-components ── */

function NavLink({ item, active }: { item: NavItemDef; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
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
}

function MarketSearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: dbMarkets } = useMarkets();

  const results = (() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (dbMarkets || [])
      .map(dbMarketToMarket)
      .filter((m) => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      .slice(0, 6);
  })();

  const showDropdown = focused && query.trim().length > 0;

  const handleSelect = useCallback((id: string) => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    navigate(`/market/${id}`);
  }, [navigate]);

  return (
    <div className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search markets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="h-8 w-48 lg:w-56 pl-8 pr-8 rounded-lg bg-secondary/80 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
        />
        {query && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">No markets found</p>
          ) : (
            <ul className="py-1">
              {results.map((m) => {
                const cfg = categoryConfig[m.category];
                return (
                  <li key={m.id}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(m.id)}
                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-accent transition-colors flex items-center gap-2"
                    >
                      {cfg && <span>{cfg.emoji}</span>}
                      <span className="truncate font-medium text-foreground">{m.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { data: balances = [] } = useBalances();
  const usdBalance = balances.find((b: any) => b.currency === 'USD');
  const totalUsd = usdBalance ? Number(usdBalance.amount) : 0;

  if (!user) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
        <User className="h-4 w-4" />
        <span className="hidden lg:inline truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
        {totalUsd > 0 && (
          <span className="text-[10px] font-mono text-primary ml-1">
            ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-0.5 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          {ACCOUNT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-destructive hover:bg-accent transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/* ── Main Navbar ── */

export default function Navbar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-14 gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center shrink-0 mr-2">
          <img src={logoIcon} alt="LIME" className="h-7 sm:hidden" />
          <img src={logoFull} alt="LIME" className="hidden sm:block h-8" />
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.path} item={item} active={pathname === item.path} />
          ))}
        </nav>

        {/* Search */}
        <MarketSearchBar />

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <AccountDropdown />
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
        {[...PRIMARY_NAV, ...(user ? ACCOUNT_NAV : [])].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all',
                pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
