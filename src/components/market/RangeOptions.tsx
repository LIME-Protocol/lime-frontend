import { useState } from 'react';
import type { MarketRange } from '@/lib/types';
import { formatCurrency, formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

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

function RangeItem({
  range,
  unit,
  isSelected,
}: {
  range: MarketRange;
  unit: string;
  isSelected: boolean;
}) {
  const isBookbuilding = range.status === 'preliminary';

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2 min-w-0">
        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
        <span className="font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
          {formatBound(range.lowerBound)}–{formatBound(range.upperBound)}
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span>
        </span>
        {isBookbuilding && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/15 text-warning">
            BOOK
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 text-right">
        <div>
          <p className="text-xs font-bold font-mono tabular-nums">{formatPrice(range.currentPrice)}</p>
          <p className="text-[9px] text-muted-foreground">price</p>
        </div>
        <div>
          <p className="text-xs font-semibold font-mono tabular-nums">
            {isBookbuilding ? '—' : formatCurrency(range.totalVolume)}
          </p>
          <p className="text-[9px] text-muted-foreground">total vol</p>
        </div>
      </div>
    </div>
  );
}

export default function RangeOptions({ ranges, unit, activeRangeId, onSelectRange }: RangeOptionsProps) {
  const [open, setOpen] = useState(false);

  if (ranges.length === 0) return null;

  const activeRange = ranges.find((r) => r.id === activeRangeId) ?? ranges[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left',
            'border-border/60 bg-secondary/30 hover:bg-secondary/50 hover:border-border',
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Range</span>
            <span className="font-mono text-xs font-semibold tabular-nums">
              {formatBound(activeRange.lowerBound)}–{formatBound(activeRange.upperBound)}
              <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span>
            </span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1.5 space-y-0.5">
        {ranges.map((range) => {
          const isSelected = range.id === activeRange.id;
          return (
            <button
              key={range.id}
              onClick={() => {
                onSelectRange?.(range.id);
                setOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2.5 rounded-md transition-colors text-left',
                isSelected
                  ? 'bg-primary/10'
                  : 'hover:bg-secondary/60',
              )}
            >
              <RangeItem range={range} unit={unit} isSelected={isSelected} />
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
