import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil, payoffCurveLabel } from '@/lib/types';
import { fmtImplied, getCategoryEmoji } from '@/lib/format';
import StatusBadge from '@/components/shared/StatusBadge';
import MiniSparkline from '@/components/market/MiniSparkline';
import { cn } from '@/lib/utils';
import { TrendingUp, Clock, Calendar, Users, ArrowRight } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  index?: number;
  variant?: 'default' | 'hero';
}

export default function MarketCard({ market, index = 0, variant = 'default' }: MarketCardProps) {
  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const days = daysUntil(market.resolutionDate);
  const closingSoon = days <= 14 && market.status === 'active';
  const isResolved = market.status === 'resolved';
  const isPreliminary = market.status === 'preliminary';
  const isHero = variant === 'hero';

  return (
    <Link
      to={`/market/${market.id}`}
      className={cn(
        'group block surface-card-hover animate-reveal-up overflow-hidden',
        isHero ? 'relative' : 'p-5'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {isHero && market.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img src={market.imageUrl} alt={market.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <StatusBadge type="market" status={market.status} />
            {market.trending && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-warning/20 text-warning text-[10px] font-semibold backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" /> HOT
              </span>
            )}
          </div>
        </div>
      )}

      <div className={cn(isHero && 'p-5 pt-3')}>
        {!isHero && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[13px]">{getCategoryEmoji(market.category)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{market.category}</span>
            <StatusBadge type="market" status={market.status} />
            {market.payoffCurve && market.payoffCurve.type !== 'linear' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-semibold">
                {payoffCurveLabel(market.payoffCurve)}
              </span>
            )}
            {market.trending && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-warning">
                <TrendingUp className="h-3 w-3" /> HOT
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="flex items-start gap-2 mb-3">
          {isHero && <span className="text-lg shrink-0 mt-0.5">{getCategoryEmoji(market.category)}</span>}
          <div className="min-w-0 flex-1">
            {isHero && market.payoffCurve && market.payoffCurve.type !== 'linear' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-semibold mb-1.5">
                {payoffCurveLabel(market.payoffCurve)}
              </span>
            )}
            <h3 className={cn(
              'font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors',
              isHero ? 'text-[16px] min-h-[2.5rem]' : 'text-[14px] min-h-[2.5rem]'
            )}>
              {market.title}
            </h3>
          </div>
        </div>

        {/* Price + Sparkline row */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-[10px] text-muted-foreground font-medium">Market Consensus</span>
            <div className="flex items-baseline gap-1">
              <span className={cn('font-bold font-mono tabular-nums leading-none', isHero ? 'text-[28px]' : 'text-[24px]')}>
                {fmtImplied(implied, market.unit)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{market.unit}</span>
            </div>
          </div>
          <MiniSparkline currentPrice={market.currentPrice} width={isHero ? 90 : 70} height={isHero ? 32 : 24} />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">
            Buy: <span className="font-mono tabular-nums text-positive font-medium">{formatPrice(market.currentPrice)}</span>
            <span className="mx-1.5 text-border">|</span>
            Sell: <span className="font-mono tabular-nums text-negative font-medium">{formatPrice(1 - market.currentPrice)}</span>
          </span>
          {isResolved && market.resolvedValue !== undefined && (
            <span className="text-xs text-positive font-medium font-mono tabular-nums">
              Settled: {fmtImplied(market.resolvedValue, market.unit)} {market.unit}
            </span>
          )}
        </div>

        {/* Bookbuilding progress */}
        {isPreliminary && market.participantCount !== undefined && market.minParticipants && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Bookbuilding
              </span>
              <span className="text-[10px] font-mono font-semibold text-info">
                {market.participantCount}/{market.minParticipants}
              </span>
            </div>
            <div className="range-track">
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${Math.min(100, (market.participantCount / market.minParticipants) * 100)}%`,
                background: 'linear-gradient(90deg, hsl(var(--info) / 0.7), hsl(var(--info)))',
              }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="data-value text-foreground">{formatCurrency(market.volume24h)}</span>
            <span>24h vol</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn('flex items-center gap-1', closingSoon && 'text-warning font-semibold')}>
              {closingSoon ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {closingSoon ? `${days}d left` : new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-primary font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Details <ArrowRight className="h-3 w-3" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

