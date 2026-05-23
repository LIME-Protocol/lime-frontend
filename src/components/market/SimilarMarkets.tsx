import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil } from '@/lib/types';
import { fmtImplied, getCategoryEmoji } from '@/lib/format';
import StatusBadge from '@/components/shared/StatusBadge';
import { useMarkets } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import { ArrowRight, Calendar } from 'lucide-react';

type SimilarSize = 'large' | 'medium' | 'small';

interface SimilarMarketsProps {
  currentMarketId: string;
  category: string;
  size?: SimilarSize;
  maxItems?: number;
  title?: string;
}

function getSimilarMarkets(allMarkets: Market[], currentId: string, category: string, max: number): Market[] {
  // Same category, highest volume first, excluding current market
  const sameCategory = allMarkets
    .filter(m => m.id !== currentId && m.category === category && m.status === 'active')
    .sort((a, b) => b.volume24h - a.volume24h);
  return sameCategory.slice(0, max);
}

export default function SimilarMarkets({ currentMarketId, category, size = 'medium', maxItems, title }: SimilarMarketsProps) {
  const { data: dbMarkets = [] } = useMarkets();
  const count = maxItems ?? (size === 'large' ? 4 : size === 'medium' ? 3 : 2);
  const markets = useMemo(
    () => getSimilarMarkets(dbMarkets.map(dbMarketToMarket), currentMarketId, category, count),
    [dbMarkets, currentMarketId, category, count],
  );

  if (markets.length === 0) return null;

  if (size === 'large') return <LargeView markets={markets} title={title} />;
  if (size === 'medium') return <MediumView markets={markets} title={title} />;
  return <SmallView markets={markets} title={title} />;
}

function LargeView({ markets, title }: { markets: Market[]; title?: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title || 'Similar Markets'}</h3>
        <Link to="/app" className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {markets.map((m) => {
          const implied = impliedValue(m.currentPrice, m.lowerBound, m.upperBound);
          const days = daysUntil(m.resolutionDate);
          return (
            <Link key={m.id} to={`/market/${m.id}`} className="surface-card-hover overflow-hidden group">
              {m.imageUrl && (
                <div className="relative h-28 overflow-hidden">
                  <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <StatusBadge type="market" status={m.status} />
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{getCategoryEmoji(m.category)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{m.category}</span>
                </div>
                <h4 className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{m.title}</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold font-mono tabular-nums">{fmtImplied(implied, m.unit)}<span className="text-xs text-muted-foreground ml-1">{m.unit}</span></p>
                    <p className="text-[10px] text-muted-foreground">Contract: {formatPrice(m.currentPrice)}</p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">
                    <p>{formatCurrency(m.volume24h)} vol</p>
                    <p className="flex items-center gap-1 justify-end"><Calendar className="h-3 w-3" />{days}d</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MediumView({ markets, title }: { markets: Market[]; title?: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title || 'Related Markets'}</h3>
      <div className="space-y-2">
        {markets.map((m) => {
          const implied = impliedValue(m.currentPrice, m.lowerBound, m.upperBound);
          return (
            <Link key={m.id} to={`/market/${m.id}`} className="flex items-center gap-3 surface-card-hover p-3 group">
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.title} className="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg shrink-0">{getCategoryEmoji(m.category)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-snug truncate group-hover:text-primary transition-colors">{m.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{m.category}</span>
                  <StatusBadge type="market" status={m.status} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono tabular-nums">{fmtImplied(implied, m.unit)}</p>
                <p className="text-[10px] text-muted-foreground">{formatPrice(m.currentPrice)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SmallView({ markets, title }: { markets: Market[]; title?: string }) {
  return (
    <div className="space-y-2">
      <p className="data-label">{title || 'You might also like'}</p>
      {markets.map((m) => (
        <Link key={m.id} to={`/market/${m.id}`} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-secondary/60 transition-colors group">
          <span className="text-sm shrink-0">{getCategoryEmoji(m.category)}</span>
          <p className="text-[11px] font-medium truncate flex-1 group-hover:text-primary transition-colors">{m.title}</p>
          <span className="text-[11px] font-mono font-semibold tabular-nums text-muted-foreground shrink-0">
            {formatPrice(m.currentPrice)}
          </span>
        </Link>
      ))}
    </div>
  );
}
