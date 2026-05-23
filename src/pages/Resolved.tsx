import { useMemo } from 'react';
import { useMarkets } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import { calculatePayoff, formatCurrency } from '@/lib/types';
import type { Market } from '@/lib/types';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Resolved() {
  const { data: dbMarkets } = useMarkets('resolved');

  const resolved: Market[] = useMemo(() => {
    return (dbMarkets || []).map(dbMarketToMarket);
  }, [dbMarkets]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-[22px] font-bold mb-1">Resolved Markets</h1>
        <p className="text-sm text-muted-foreground">Markets that have been settled with final values</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-reveal-up stagger-1">
        <div className="surface-card px-4 py-3">
          <p className="data-label mb-0.5">Total Resolved</p>
          <p className="text-xl font-bold font-mono tabular-nums">{resolved.length}</p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="data-label mb-0.5">Total Volume</p>
          <p className="text-xl font-bold font-mono tabular-nums">
            {formatCurrency(resolved.reduce((s, m) => s + m.totalVolume, 0))}
          </p>
        </div>
      </div>

      {resolved.length === 0 ? (
        <EmptyState icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />} title="No resolved markets yet" description="Markets will appear here once settled" />
      ) : (
        <div className="space-y-3">
          {resolved.map((m, i) => {
            const payoff = m.resolvedValue !== undefined ? calculatePayoff(m.resolvedValue, m.lowerBound, m.upperBound) : 0;
            const rule = m.resolvedValue !== undefined && m.resolvedValue <= m.lowerBound ? 'Floor (below L)'
              : m.resolvedValue !== undefined && m.resolvedValue >= m.upperBound ? 'Cap (above U)'
              : 'Linear interpolation';

            return (
              <Link to={`/market/${m.id}`} key={m.id}
                className="block surface-card-hover p-5 animate-reveal-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge type="market" status="resolved" />
                      <span className="data-label">{m.category}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold mb-2">{m.title}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="data-label mb-0.5">Settled Value</p>
                        <p className="data-value text-foreground">{m.resolvedValue?.toLocaleString()} {m.unit}</p>
                      </div>
                      <div>
                        <p className="data-label mb-0.5">Range</p>
                        <p className="font-mono tabular-nums text-muted-foreground">{m.lowerBound.toLocaleString()} – {m.upperBound.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="data-label mb-0.5">Rule</p>
                        <p className="font-medium text-foreground">{rule}</p>
                      </div>
                      <div>
                        <p className="data-label mb-0.5">Source</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.settlementSource}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold font-mono tabular-nums text-positive">{(payoff * 100).toFixed(1)}¢</p>
                    <p className="data-label">Payoff</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
