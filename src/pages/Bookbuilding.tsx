import { useMemo } from 'react';
import { useMarkets } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import type { Market } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import EmptyState from '@/components/shared/EmptyState';
import { BookOpen, Users } from 'lucide-react';

export default function Bookbuilding() {
  const { data: dbMarkets } = useMarkets();

  const allMarkets: Market[] = useMemo(() => {
    return (dbMarkets || []).map(dbMarketToMarket);
  }, [dbMarkets]);

  const preliminary = useMemo(() => allMarkets.filter(m => m.status === 'preliminary'), [allMarkets]);
  const pending = useMemo(() => allMarkets.filter(m => m.status === 'pending'), [allMarkets]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
      <div className="animate-reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-info/15 border border-info/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-info" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold">Bookbuilding</h1>
            <p className="text-sm text-muted-foreground">Community-submitted markets gathering liquidity before going live</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-reveal-up stagger-1">
        <div className="surface-card px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="h-3.5 w-3.5 text-info" />
            <p className="data-label">In Bookbuilding</p>
          </div>
          <p className="text-xl font-bold font-mono tabular-nums">{preliminary.length}</p>
        </div>
        <div className="surface-card px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-warning" />
            <p className="data-label">Pending Review</p>
          </div>
          <p className="text-xl font-bold font-mono tabular-nums">{pending.length}</p>
        </div>
      </div>

      {preliminary.length === 0 && pending.length === 0 ? (
        <EmptyState title="No markets in bookbuilding" description="Submit a market proposal to start the process" />
      ) : (
        <>
          {preliminary.length > 0 && (
            <div className="space-y-3 animate-reveal-up stagger-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <h2 className="text-sm font-semibold">Gathering Liquidity</h2>
                  <p className="text-[11px] text-muted-foreground">These markets need more participants to go active</p>
                </div>
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {preliminary.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
                </div>
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div className="space-y-3 animate-reveal-up stagger-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <h2 className="text-sm font-semibold">Pending Admin Review</h2>
                  <p className="text-[11px] text-muted-foreground">Submitted by community, awaiting approval</p>
                </div>
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pending.map((m, i) => <MarketCard key={m.id} market={m} index={i} />)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
