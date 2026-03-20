import { useState, useMemo } from 'react';
import { markets, categories } from '@/lib/mock-data';
import { daysUntil } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import MarketTable from '@/components/market/MarketTable';
import EmptyState from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Search, Flame, Clock, CheckCircle } from 'lucide-react';

type ViewMode = 'cards' | 'table';

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('cards');

  const activeMarkets = useMemo(() =>
    markets.filter((m) => m.status === 'active'), []);

  const filtered = useMemo(() => {
    return activeMarkets.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeMarkets, category, search]);

  const trending = useMemo(() =>
    activeMarkets.filter((m) => m.trending).slice(0, 4), [activeMarkets]);

  const closingSoon = useMemo(() =>
    activeMarkets
      .filter((m) => daysUntil(m.resolutionDate) <= 60)
      .sort((a, b) => daysUntil(a.resolutionDate) - daysUntil(b.resolutionDate))
      .slice(0, 4),
    [activeMarkets]);

  const recentlyResolved = useMemo(() =>
    markets.filter((m) => m.status === 'resolved').slice(0, 3), []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      {/* Header */}
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-bold mb-1">Explore Markets</h1>
        <p className="text-sm text-muted-foreground">
          Trade expectations on future economic variables
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
        <StatCard label="Active Markets" value={String(activeMarkets.length)} />
        <StatCard label="24h Volume" value="$2.6M" />
        <StatCard label="Open Interest" value="$9.5M" />
        <StatCard label="Resolved" value={String(markets.filter(m => m.status === 'resolved').length)} />
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <Section icon={<Flame className="h-4 w-4 text-warning" />} title="Trending" delay={2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trending.map((m, i) => (
              <MarketCard key={m.id} market={m} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <Section icon={<Clock className="h-4 w-4 text-warning" />} title="Closing Soon" delay={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {closingSoon.map((m, i) => (
              <MarketCard key={m.id} market={m} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Recently Resolved */}
      {recentlyResolved.length > 0 && (
        <Section icon={<CheckCircle className="h-4 w-4 text-positive" />} title="Recently Resolved" delay={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyResolved.map((m, i) => (
              <MarketCard key={m.id} market={m} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* All Markets header */}
      <div className="space-y-4 animate-reveal-up stagger-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Markets</h2>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setView('cards')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                view === 'cards' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                view === 'table' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95',
                  category === cat
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market list */}
      {filtered.length === 0 ? (
        <EmptyState title="No markets found" description="Try adjusting your filters or search terms" />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <MarketCard key={m.id} market={m} index={i} />
          ))}
        </div>
      ) : (
        <MarketTable markets={filtered} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-raised rounded-xl border px-4 py-3">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-lg font-bold font-mono tabular-nums">{value}</p>
    </div>
  );
}

function Section({ icon, title, children, delay }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }) {
  return (
    <div className={`space-y-3 animate-reveal-up stagger-${delay}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
