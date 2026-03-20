import { markets } from '@/lib/mock-data';
import { calculatePayoff } from '@/lib/types';
import MarketCard from '@/components/market/MarketCard';
import EmptyState from '@/components/shared/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function Resolved() {
  const resolved = markets.filter((m) => m.status === 'resolved');

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-bold mb-1">Resolved Markets</h1>
        <p className="text-sm text-muted-foreground">Markets that have been settled with final values</p>
      </div>

      {/* Summary */}
      <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Total Resolved</p>
            <p className="text-xl font-bold font-mono tabular-nums">{resolved.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Total Volume</p>
            <p className="text-xl font-bold font-mono tabular-nums">
              ${((resolved.reduce((s, m) => s + m.totalVolume, 0)) / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      {/* Resolved table */}
      {resolved.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
          title="No resolved markets yet"
          description="Markets will appear here once they've been settled"
        />
      ) : (
        <div className="space-y-3">
          {resolved.map((m, i) => {
            const payoff = m.resolvedValue !== undefined
              ? calculatePayoff(m.resolvedValue, m.lowerBound, m.upperBound)
              : 0;

            return (
              <div
                key={m.id}
                className="surface-raised rounded-xl border p-5 animate-reveal-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]">
                        Resolved
                      </span>
                      <span className="text-[11px] text-muted-foreground">{m.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-2">{m.title}</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Settled Value</p>
                        <p className="font-mono tabular-nums font-semibold text-foreground">
                          {m.resolvedValue?.toLocaleString()} {m.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Range</p>
                        <p className="font-mono tabular-nums">
                          {m.lowerBound.toLocaleString()} – {m.upperBound.toLocaleString()} {m.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rule Applied</p>
                        <p className="font-medium">
                          {m.resolvedValue !== undefined && m.resolvedValue <= m.lowerBound ? 'Floor (below L)' :
                           m.resolvedValue !== undefined && m.resolvedValue >= m.upperBound ? 'Cap (above U)' :
                           'Linear interpolation'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Settlement</p>
                        <p className="text-[11px]">{m.settlementSource}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold font-mono tabular-nums text-positive">
                      {(payoff * 100).toFixed(1)}¢
                    </p>
                    <p className="text-[11px] text-muted-foreground">Final Payoff</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
