import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  market: Market;
  index?: number;
}

export default function MarketCard({ market, index = 0 }: MarketCardProps) {
  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const days = daysUntil(market.resolutionDate);
  const closingSoon = days <= 14 && market.status === 'active';

  return (
    <Link
      to={`/market/${market.id}`}
      className="block surface-raised-hover rounded-xl border p-5 transition-all duration-200 hover:border-accent/30 active:scale-[0.98] animate-reveal-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top row: category + status */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">
          {market.category}
        </Badge>
        <StatusBadge type="market" status={market.status} />
        {market.trending && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-warning">
            <TrendingUp className="h-3 w-3" /> Trending
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
        {market.title}
      </h3>

      {/* Implied value + price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold font-mono tabular-nums">
          {formatNumber(implied, market.unit)}
        </span>
        <span className="text-xs text-muted-foreground">{market.unit}</span>
        <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
          {formatPrice(market.currentPrice)}
        </span>
      </div>

      {/* Range bar */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, market.currentPrice * 100))}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatBound(market.lowerBound)} {market.unit}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatBound(market.upperBound)} {market.unit}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {formatCurrency(market.volume24h)}
        </span>
        <span className={cn(
          'flex items-center gap-1',
          closingSoon && 'text-warning font-medium'
        )}>
          {closingSoon ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
          {closingSoon ? `${days}d left` : new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}

function formatNumber(n: number, unit: string): string {
  if (unit === '$' || unit === '$/oz' || unit === '$/bbl') {
    return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  }
  if (unit === 'pts') return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}

function formatBound(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US') : n.toString();
}
