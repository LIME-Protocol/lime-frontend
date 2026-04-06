import { useNavigate } from 'react-router-dom';
import type { MarketRange } from '@/lib/types';
import { formatCurrency, formatPrice } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RangeOptionsProps {
  ranges: MarketRange[];
  unit: string;
  activeRangeId?: string;
}

function formatBound(value: number, unit: string): string {
  if (Math.abs(value) >= 1000) {
    return `${value.toLocaleString()}`;
  }
  return `${value}`;
}

export default function RangeOptions({ ranges, unit, activeRangeId }: RangeOptionsProps) {
  if (ranges.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-3">Range Options</h3>
      <div className="space-y-2">
        {ranges.map((range) => {
          const isActive = range.id === activeRangeId;
          const isBookbuilding = range.status === 'preliminary';

          return (
            <div
              key={range.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all',
                isActive
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/50 bg-secondary/30 hover:bg-secondary/50',
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold truncate">{range.label}</span>
                    {isBookbuilding && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/15 text-warning">
                        BOOKBUILDING
                      </span>
                    )}
                    {isActive && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/15 text-primary">
                        VIEWING
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {formatBound(range.lowerBound, unit)} – {formatBound(range.upperBound, unit)} {unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="text-xs font-bold font-mono tabular-nums">{formatPrice(range.currentPrice)}</p>
                  <p className="text-[10px] text-muted-foreground">price</p>
                </div>
                {!isBookbuilding && (
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold font-mono tabular-nums">{formatCurrency(range.volume24h)}</p>
                    <p className="text-[10px] text-muted-foreground">24h vol</p>
                  </div>
                )}
                {isBookbuilding && (
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-warning">Gathering</p>
                    <p className="text-[10px] text-muted-foreground">interest</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
