import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { TrendingUp, Clock, Calendar, ArrowRight } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  index?: number;
}

export default function MarketCard({ market, index = 0 }: MarketCardProps) {
  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const days = daysUntil(market.resolutionDate);
  const closingSoon = days <= 14 && market.status === 'active';
  const isResolved = market.status === 'resolved';

  return (
    <Link
      to={`/market/${market.id}`}
      className="group block surface-card-hover p-5 animate-reveal-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header: category + status + trending */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {market.category}
        </span>
        <StatusBadge type="market" status={market.status} />
        {market.trending && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-warning">
            <TrendingUp className="h-3 w-3" /> HOT
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-semibold leading-snug mb-4 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
        {market.title}
      </h3>

      {/* Implied value — hero element */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[28px] font-bold font-mono tabular-nums leading-none">
          {fmtImplied(implied, market.unit)}
        </span>
        <span className="text-xs text-muted-foreground font-medium">{market.unit}</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-muted-foreground">
          Contract: <span className="font-mono tabular-nums text-foreground font-medium">{formatPrice(market.currentPrice)}</span>
        </span>
        {isResolved && market.resolvedValue !== undefined && (
          <span className="text-xs text-positive font-medium font-mono tabular-nums">
            Settled: {fmtImplied(market.resolvedValue, market.unit)} {market.unit}
          </span>
        )}
      </div>

      {/* L — U range bar with labels */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            L {fmtBound(market.lowerBound)}
          </span>
          <div className="flex-1 range-track">
            <div className="range-fill" style={{ width: `${clamp(market.currentPrice * 100)}%` }} />
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            U {fmtBound(market.upperBound)}
          </span>
        </div>
      </div>

      {/* Footer: volume + resolution date */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="data-value text-foreground">{formatCurrency(market.volume24h)}</span>
          <span>24h vol</span>
        </span>
        <span className={cn(
          'flex items-center gap-1',
          closingSoon && 'text-warning font-semibold'
        )}>
          {closingSoon ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
          {closingSoon
            ? `${days}d left`
            : new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        </span>
      </div>
    </Link>
  );
}

function fmtImplied(n: number, unit: string): string {
  if (unit === '$' || unit === '$/oz' || unit === '$/bbl') return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  if (unit === 'pts') return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}

function fmtBound(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toString();
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}
