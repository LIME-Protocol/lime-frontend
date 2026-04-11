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
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold">Ranges</h3>
        <span className="text-[10px] text-muted-foreground">{ranges.length} available</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ranges.map((range) => {
          const isSelected = range.id === activeRangeId;
          const isBookbuilding = range.status === 'preliminary';

          return (
            <button
              key={range.id}
              onClick={() => onSelectRange?.(range.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground'
                  : 'border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border text-muted-foreground',
              )}
            >
              {/* Bounds */}
              <span className="font-semibold tabular-nums whitespace-nowrap">
                {formatBound(range.lowerBound)}–{formatBound(range.upperBound)}
                <span className="ml-0.5 text-[10px] font-normal">{unit}</span>
              </span>

              {/* Price */}
              <span className={cn('tabular-nums', isSelected && 'text-primary')}>
                {formatPrice(range.currentPrice)}
              </span>

              {/* Total volume or bookbuilding badge */}
              {isBookbuilding ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/15 text-warning">
                  BOOK
                </span>
              ) : (
                <span className="tabular-nums text-[11px]">
                  {formatCurrency(range.totalVolume)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
