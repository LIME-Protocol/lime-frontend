import { useState, useMemo } from 'react';
import { markets, categories } from '@/lib/mock-data';
import { daysUntil, formatCurrency } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import MarketTable from '@/components/market/MarketTable';
import EmptyState from '@/components/shared/EmptyState';
import InfoTip from '@/components/shared/InfoTip';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Search, Flame, Clock, CheckCircle, Activity } from 'lucide-react';

type ViewMode = 'cards' | 'table';

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('cards');

  const activeMarkets = useMemo(() => markets.filter((m) => m.status === 'active'), []);

  const filtered = useMemo(() => {
    return activeMarkets.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeMarkets, category, search]);

  const trending = useMemo(() => activeMarkets.filter((m) => m.trending).slice(0, 4), [activeMarkets]);
  const closingSoon = useMemo(() =>
    activeMarkets
      .filter((m) => daysUntil(m.resolutionDate) <= 60)
      .sort((a, b) => daysUntil(a.resolutionDate) - daysUntil(b.resolutionDate))
      .slice(0, 4),
    [activeMarkets]);
  const recentlyResolved = useMemo(() => markets.filter((m) => m.status === 'resolved').slice(0, 3), []);

  const totalVol = activeMarkets.reduce((s, m) => s + m.volume24h, 0);
  const totalOI = activeMarkets.reduce((s, m) => s + m.openInterest, 0);

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
        <StatCard label="Open Interest" value={formatCurrency(totalOI)} />
        <StatCard icon={<CheckCircle className="h-3.5 w-3.5 text-info" />} label="Resolved" value={String(markets.filter(m => m.status === 'resolved').length)} />
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <Section icon={<Flame className="h-4 w-4 text-warning" />} title="Trending" subtitle="Most traded markets right now" delay={2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trending.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <Section icon={<Clock className="h-4 w-4 text-warning" />} title="Closing Soon" subtitle="Markets approaching resolution" delay={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {closingSoon.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* Recently Resolved */}
      {recentlyResolved.length > 0 && (
        <Section icon={<CheckCircle className="h-4 w-4 text-positive" />} title="Recently Resolved" subtitle="Settled markets with final payoffs" delay={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyResolved.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
          </div>
        </Section>
      )}

      {/* All Markets */}
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

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
                  category === cat
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
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

function Section({ icon, title, subtitle, children, delay }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode; delay: number }) {
  return (
    <div className={`space-y-3 animate-reveal-up stagger-${delay}`}>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          {icon}
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {subtitle && <p className="text-[11px] text-muted-foreground ml-6">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
