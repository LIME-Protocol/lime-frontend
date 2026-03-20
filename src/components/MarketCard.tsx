import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  index: number;
}

export default function MarketCard({ market, index }: MarketCardProps) {
  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const isResolved = market.status === 'resolved';

  return (
    <Link
      to={`/market/${market.id}`}
      className="block surface-raised rounded-xl border p-5 transition-all duration-200 hover:border-accent/30 active:scale-[0.98] animate-reveal-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge
          variant="secondary"
          className="text-[11px] font-medium px-2 py-0.5 shrink-0"
        >
          {market.category}
        </Badge>
        {isResolved && (
          <Badge className="bg-positive/10 text-positive text-[11px] px-2 py-0.5 hover:bg-positive/10">
            Resolvido
          </Badge>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2">
        {market.title}
      </h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
          {implied.toFixed(1)}
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
            style={{ width: `${market.currentPrice * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono text-muted-foreground">
            {market.lowerBound.toLocaleString()} {market.unit}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {market.upperBound.toLocaleString()} {market.unit}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Vol. {formatCurrency(market.totalVolume)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(market.resolutionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}
