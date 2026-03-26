import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil, payoffCurveLabel, calculatePayoff } from '@/lib/types';
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
            <span className="text-[13px]">{market.emoji}</span>
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
          {isHero && <span className="text-lg shrink-0 mt-0.5">{market.emoji}</span>}
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
            <span className={cn('font-bold font-mono tabular-nums leading-none', isHero ? 'text-[28px]' : 'text-[24px]')}>
              {fmtImplied(implied, market.unit)}
            </span>
            <span className="text-xs text-muted-foreground font-medium ml-1">{market.unit}</span>
          </div>
          <MiniSparkline currentPrice={market.currentPrice} width={isHero ? 90 : 70} height={isHero ? 32 : 24} />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">
            Contract: <span className="font-mono tabular-nums text-foreground font-medium">{formatPrice(market.currentPrice)}</span>
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

/** Tiny payoff curve preview */
function MiniPayoffCurve({ market }: { market: Market }) {
  const w = 120;
  const h = 20;
  const steps = 30;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const val = market.lowerBound + t * (market.upperBound - market.lowerBound);
    const payoff = calculatePayoff(val, market.lowerBound, market.upperBound, market.payoffCurve);
    const x = (t * w).toFixed(1);
    const y = (h - payoff * (h - 2) - 1).toFixed(1);
    points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  const curveLabel = market.payoffCurve ? payoffCurveLabel(market.payoffCurve) : 'Linear';
  return (
    <div className="flex items-center gap-2 bg-secondary/40 rounded-lg px-2.5 py-1.5">
      <svg width={w} height={h} className="shrink-0">
        <path d={points.join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{curveLabel}</span>
    </div>
  );
}

function fmtImplied(n: number, unit: string): string {
  if (unit === '$' || unit === '$/oz' || unit === '$/bbl') return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  if (unit === 'pts') return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}
