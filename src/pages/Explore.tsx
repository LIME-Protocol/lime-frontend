import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { markets as mockMarkets, categoryConfig } from '@/lib/mock-data';
import { useMarkets } from '@/hooks/use-markets';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { dbMarketToMarket } from '@/lib/adapters';
import { daysUntil, formatCurrency, formatPrice } from '@/lib/types';
import type { Market } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import MarketTable from '@/components/market/MarketTable';
import DashboardCard from '@/components/shared/DashboardCard';
import Section from '@/components/shared/Section';
import EmptyState from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Search, Flame, Clock, CheckCircle, Activity, Users, X, TrendingUp, BarChart3 } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';

type ViewMode = 'cards' | 'table';
type StatusFilter = 'all' | 'active' | 'resolved';
type SortKey = 'trending' | 'closing' | 'volume' | 'users';

const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: 'trending', label: 'Trending', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: 'closing', label: 'Closing Date', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'volume', label: 'Volume', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: 'users', label: 'Open Interest', icon: <Users className="h-3.5 w-3.5" /> },
];

const statusFilters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Activity className="h-3.5 w-3.5" /> },
  { key: 'active', label: 'Active', icon: <Flame className="h-3.5 w-3.5" /> },
  { key: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

export default function Explore() {
  const navigate = useNavigate();
  const allMarketsRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState('All');
  const [trendingCategory, setTrendingCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('trending');

  const { data: dbMarkets } = useMarkets();
  const { data: stats } = useDashboardStats();

  const allMarkets: Market[] = useMemo(() => {
    const fromDb = (dbMarkets || []).map(dbMarketToMarket);
    if (fromDb.length > 0) return [...fromDb, ...mockMarkets];
    return mockMarkets;
  }, [dbMarkets]);

  const activeMarkets = useMemo(() => allMarkets.filter((m) => m.status === 'active'), [allMarkets]);

  const allCategories = useMemo(() => {
    const cats = new Set(allMarkets.map(m => m.category));
    return ['All', ...Array.from(cats).sort()];
  }, [allMarkets]);

  /* ── Trending filtered by sector ── */
  const trending = useMemo(() => {
    const base = activeMarkets.filter((m) => m.trending);
    const filtered = trendingCategory === 'All' ? base : base.filter((m) => m.category === trendingCategory);
    return filtered.slice(0, 6);
  }, [activeMarkets, trendingCategory]);

  const closingSoon = useMemo(() =>
    activeMarkets
      .filter((m) => daysUntil(m.resolutionDate) <= 60)
      .sort((a, b) => daysUntil(a.resolutionDate) - daysUntil(b.resolutionDate))
      .slice(0, 4),
    [activeMarkets]);

  const filtered = useMemo(() => {
    let list = allMarkets.filter((m) => {
      if (statusFilter === 'active' && m.status !== 'active') return false;
      if (statusFilter === 'resolved' && m.status !== 'resolved') return false;
      if (statusFilter === 'all' && (m.status === 'pending' || m.status === 'preliminary')) return false;
      if (category !== 'All' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'trending') {
        if (a.trending && !b.trending) return -1;
        if (!a.trending && b.trending) return 1;
        return b.volume24h - a.volume24h;
      }
      if (sortBy === 'closing') return daysUntil(a.resolutionDate) - daysUntil(b.resolutionDate);
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'users') return b.openInterest - a.openInterest;
      return 0;
    });

    return list;
  }, [allMarkets, category, search, statusFilter, sortBy]);

  const scrollToAllMarkets = (filter?: StatusFilter, sort?: SortKey) => {
    if (filter) setStatusFilter(filter);
    if (sort) setSortBy(sort);
    setTimeout(() => allMarketsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      {/* Hero Header */}
      <div className="animate-reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <img src={logoIcon} alt="LIME" className="h-7" />
          <div>
            <h1 className="text-[22px] font-bold mb-0">Explore Markets</h1>
            <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">LIME · Linear Index Market Exchange</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-reveal-up stagger-1">
        <DashboardCard
          emoji="📊"
          label="Active Markets"
          value={String(stats?.activeMarkets ?? activeMarkets.length)}
          sub="tradable now"
          color="primary"
          onClick={() => scrollToAllMarkets('active', 'trending')}
        />
        <DashboardCard
          emoji="🔥"
          label="24h Volume"
          value={formatCurrency(stats?.totalVolume24h ?? 0)}
          sub="traded in 24h"
          color="warning"
          onClick={() => scrollToAllMarkets('all', 'volume')}
        />
        <DashboardCard
          emoji="💰"
          label="AuM"
          value={formatCurrency(stats?.totalOpenInterest ?? 0)}
          sub="total open interest"
          color="positive"
          onClick={() => scrollToAllMarkets('active', 'users')}
        />
        <DashboardCard
          emoji="✅"
          label="Resolved 24h"
          value={String(stats?.resolved24h ?? 0)}
          sub="markets settled"
          color="info"
          onClick={() => scrollToAllMarkets('resolved', 'trending')}
        />
      </div>

      {/* Trending with category selector */}
      <Section emoji="🔥" title="Trending" subtitle="Most traded markets right now" delay={2}>
        {/* Category chips above trending */}
        <div className="flex gap-1.5 overflow-x-auto pb-3">
          {allCategories.map((cat) => {
            const cfg = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setTrendingCategory(cat)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                  trendingCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
                )}
              >
                {cfg && <span className="text-[12px]">{cfg.emoji}</span>}
                {cat}
              </button>
            );
          })}
        </div>

        {trending.length === 0 ? (
          <EmptyState title="No trending markets" description={`No trending markets in ${trendingCategory}`} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trending.slice(0, 2).map((m, i) => (
                <MarketCard key={m.id} market={m} index={i} variant="hero" />
              ))}
            </div>
            {trending.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                {trending.slice(2).map((m, i) => (
                  <MarketCard key={m.id} market={m} index={i + 2} />
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <Section emoji="⏳" title="Closing Soon" subtitle="Markets approaching resolution" delay={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {closingSoon.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* All Markets */}
      <div ref={allMarketsRef} className="space-y-4 animate-reveal-up stagger-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">All Markets</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              {sortOptions.map(so => (
                <button key={so.key} onClick={() => setSortBy(so.key)} className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap',
                  sortBy === so.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                  {so.icon}
                  <span className="hidden sm:inline">{so.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              <button onClick={() => setView('cards')} className={cn('p-1.5 rounded-md transition-all', view === 'cards' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView('table')} className={cn('p-1.5 rounded-md transition-all', view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {statusFilters.map((sf) => (
              <button key={sf.key} onClick={() => setStatusFilter(sf.key)} className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                statusFilter === sf.key ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
              )}>
                {sf.icon} {sf.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search markets..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-9 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {allCategories.map((cat) => {
                const cfg = categoryConfig[cat];
                return (
                  <button key={cat} onClick={() => setCategory(cat)} className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                    category === cat ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
                  )}>
                    {cfg && <span className="text-[12px]">{cfg.emoji}</span>}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No markets found" description="Try adjusting your filters or search terms" />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
        </div>
      ) : (
        <MarketTable markets={filtered} />
      )}
    </div>
  );
}
