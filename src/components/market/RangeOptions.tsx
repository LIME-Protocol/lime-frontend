import type { MarketRange } from '@/lib/types';
import { formatCurrency, formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RangeOptionsProps {
  ranges: MarketRange[];
  unit: string;
  activeRangeId?: string;
  onSelectRange?: (rangeId: string) => void;
}

function formatBound(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString();
  return String(value);
}

export default function RangeOptions({ ranges, unit, activeRangeId, onSelectRange }: RangeOptionsProps) {
  if (ranges.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">Range Options</h3>
        <span className="text-[10px] text-muted-foreground">{ranges.length} available</span>
      </div>
      <div className="space-y-2">
        {ranges.map((range) => {
          const isSelected = range.id === activeRangeId;
          const isBookbuilding = range.status === 'preliminary';

          return (
            <button
              key={range.id}
              onClick={() => onSelectRange?.(range.id)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                isSelected
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border',
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-xs font-semibold', isSelected && 'text-primary')}>{range.label}</span>
                  {isBookbuilding && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/15 text-warning">
                      BOOKBUILDING
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {formatBound(range.lowerBound)} – {formatBound(range.upperBound)} {unit}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className={cn('text-xs font-bold font-mono tabular-nums', isSelected && 'text-primary')}>{formatPrice(range.currentPrice)}</p>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
