import { useState, useMemo } from 'react';
import { markets as mockMarkets, categories, categoryConfig } from '@/lib/mock-data';
import { useMarkets } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import { daysUntil, formatCurrency } from '@/lib/types';
import type { Market, MarketStatus } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import MarketTable from '@/components/market/MarketTable';
import EmptyState from '@/components/shared/EmptyState';
import InfoTip from '@/components/shared/InfoTip';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Search, Flame, Clock, CheckCircle, Activity, BookOpen, Users, X } from 'lucide-react';

type ViewMode = 'cards' | 'table';
type StatusFilter = 'all' | 'active' | 'preliminary' | 'resolved';

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: dbMarkets } = useMarkets();

  const allMarkets: Market[] = useMemo(() => {
    const fromDb = (dbMarkets || []).map(dbMarketToMarket);
    if (fromDb.length > 0) return [...fromDb, ...mockMarkets];
    return mockMarkets;
  }, [dbMarkets]);

  const activeMarkets = useMemo(() => allMarkets.filter((m) => m.status === 'active'), [allMarkets]);
  const preliminaryMarkets = useMemo(() => allMarkets.filter((m) => m.status === 'preliminary'), [allMarkets]);

  const filtered = useMemo(() => {
    return allMarkets.filter((m) => {
      if (statusFilter === 'active' && m.status !== 'active') return false;
      if (statusFilter === 'preliminary' && m.status !== 'preliminary') return false;
      if (statusFilter === 'resolved' && m.status !== 'resolved') return false;
      if (statusFilter === 'all' && (m.status === 'pending')) return false;
      if (category !== 'All' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allMarkets, category, search, statusFilter]);

  const trending = useMemo(() => activeMarkets.filter((m) => m.trending).slice(0, 6), [activeMarkets]);
  const closingSoon = useMemo(() =>
    activeMarkets
      .filter((m) => daysUntil(m.resolutionDate) <= 60)
      .sort((a, b) => daysUntil(a.resolutionDate) - daysUntil(b.resolutionDate))
      .slice(0, 4),
    [activeMarkets]);

  const totalVol = activeMarkets.reduce((s, m) => s + m.volume24h, 0);
  const totalOI = activeMarkets.reduce((s, m) => s + m.openInterest, 0);

  const allCategories = useMemo(() => {
    const cats = new Set(allMarkets.map(m => m.category));
    return ['All', ...Array.from(cats).sort()];
  }, [allMarkets]);

  const statusFilters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Activity className="h-3.5 w-3.5" /> },
    { key: 'active', label: 'Active', icon: <Flame className="h-3.5 w-3.5" /> },
    { key: 'preliminary', label: 'Bookbuilding', icon: <Users className="h-3.5 w-3.5" /> },
    { key: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      {/* Header */}
      <div className="animate-reveal-up">
        <h1 className="text-[22px] font-bold mb-1">Explore Markets</h1>
        <p className="text-sm text-muted-foreground">
          Trade expectations on future economic variables
          <InfoTip content="Each market tracks a specific variable. Buy contracts to express your view on where the value will land." />
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
        <StatCard icon={<Activity className="h-3.5 w-3.5 text-primary" />} label="Active Markets" value={String(activeMarkets.length)} />
        <StatCard icon={<Flame className="h-3.5 w-3.5 text-warning" />} label="24h Volume" value={formatCurrency(totalVol)} />
        <StatCard icon={<Users className="h-3.5 w-3.5 text-info" />} label="Bookbuilding" value={String(preliminaryMarkets.length)} />
        <StatCard icon={<CheckCircle className="h-3.5 w-3.5 text-info" />} label="Resolved" value={String(allMarkets.filter(m => m.status === 'resolved').length)} />
      </div>

      {/* ── 🔥 Trending ── */}
      {trending.length > 0 && (
        <Section emoji="🔥" title="Trending" subtitle="Most traded markets right now" delay={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Two hero cards */}
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
        </Section>
      )}

      {/* ── ⏳ Closing Soon ── */}
      {closingSoon.length > 0 && (
        <Section emoji="⏳" title="Closing Soon" subtitle="Markets approaching resolution" delay={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {closingSoon.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* ── 📋 Bookbuilding ── */}
      {preliminaryMarkets.length > 0 && (
        <Section emoji="📋" title="Bookbuilding" subtitle="Community-submitted markets gathering liquidity" delay={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {preliminaryMarkets.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* ── All Markets ── */}
      <div className="space-y-4 animate-reveal-up stagger-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">All Markets</h2>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button onClick={() => setView('cards')} className={cn('p-1.5 rounded-md transition-all', view === 'cards' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('table')} className={cn('p-1.5 rounded-md transition-all', view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col gap-3">
          {/* Status filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {statusFilters.map((sf) => (
              <button
                key={sf.key}
                onClick={() => setStatusFilter(sf.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                  statusFilter === sf.key
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
                )}
              >
                {sf.icon} {sf.label}
              </button>
            ))}
          </div>

          {/* Search + category */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-9 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
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
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                      category === cat
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

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="surface-card px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="data-label">{label}</p>
      </div>
      <p className="text-lg font-bold font-mono tabular-nums">{value}</p>
    </div>
  );
}

function Section({ emoji, title, subtitle, children, delay }: { emoji: string; title: string; subtitle?: string; children: React.ReactNode; delay: number }) {
  return (
    <div className={`space-y-3 animate-reveal-up stagger-${delay}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="border-t border-border/50 pt-4">
        {children}
      </div>
    </div>
  );
}
