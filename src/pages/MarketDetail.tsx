import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { markets as mockMarkets, generateOrderBook, generateTrades } from '@/lib/mock-data';
import { useMarket, useMarketTrades, useMarketOrders } from '@/hooks/use-markets';
import { dbMarketToMarket } from '@/lib/adapters';
import { impliedValue, formatCurrency, formatPrice, calculatePayoff, daysUntil, payoffCurveLabel } from '@/lib/types';
import type { Market, Trade, OrderBook } from '@/lib/types';
import PayoffChart from '@/components/market/PayoffChart';
import OrderBookComponent from '@/components/market/OrderBookComponent';
import TradeHistory from '@/components/market/TradeHistory';
import TradePanel from '@/components/market/TradePanel';
import ContractExplainer from '@/components/market/ContractExplainer';
import Comments from '@/components/market/Comments';
import StatusBadge from '@/components/shared/StatusBadge';
import InfoTip from '@/components/shared/InfoTip';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketDetail() {
  const { id } = useParams();

  // Try DB first, fallback to mock
  const { data: dbMarket } = useMarket(id);
  const { data: dbTrades } = useMarketTrades(id);
  const { data: dbOrders } = useMarketOrders(id);

  const market: Market | undefined = useMemo(() => {
    if (dbMarket) return dbMarketToMarket(dbMarket);
    return mockMarkets.find((m) => m.id === id);
  }, [dbMarket, id]);

  // Build trades list from DB or mock
  const trades: Trade[] = useMemo(() => {
    if (dbTrades && dbTrades.length > 0) {
      return dbTrades.map(t => ({
        id: t.id,
        marketId: t.market_id,
        side: 'buy' as const, // DB trades don't have a "side" per se, show as buy
        price: Number(t.price),
        quantity: Number(t.quantity),
        timestamp: t.executed_at,
      }));
    }
    return market ? generateTrades(market.id, market.currentPrice) : [];
  }, [dbTrades, market]);

  // Build order book from DB orders or generate mock
  const orderBook: OrderBook | null = useMemo(() => {
    if (dbOrders && dbOrders.length > 0) {
      const buyOrders = dbOrders.filter(o => o.side === 'buy').sort((a, b) => Number(b.price) - Number(a.price));
      const sellOrders = dbOrders.filter(o => o.side === 'sell').sort((a, b) => Number(a.price) - Number(b.price));

      let cumBid = 0;
      const bids = buyOrders.slice(0, 8).map(o => {
        const size = Number(o.quantity) - Number(o.filled_quantity);
        cumBid += size;
        return { price: Number(o.price), size, total: cumBid };
      });

      let cumAsk = 0;
      const asks = sellOrders.slice(0, 8).map(o => {
        const size = Number(o.quantity) - Number(o.filled_quantity);
        cumAsk += size;
        return { price: Number(o.price), size, total: cumAsk };
      });

      const spread = asks.length > 0 && bids.length > 0
        ? Number((asks[0].price - bids[0].price).toFixed(3))
        : 0;

      return { bids, asks, spread };
    }
    return market ? generateOrderBook(market.currentPrice) : null;
  }, [dbOrders, market]);

  if (!market) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Market not found</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block hover:underline">Back to Explore</Link>
      </div>
    );
  }

  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const isResolved = market.status === 'resolved';
  const days = daysUntil(market.resolutionDate);
  const resolvedPayoff = market.resolvedValue !== undefined
    ? calculatePayoff(market.resolvedValue, market.lowerBound, market.upperBound, market.payoffCurve) : undefined;

  const fmtVal = (n: number) => {
    if (market.unit === 'pts' || market.unit === '$' || market.unit === '$/oz' || market.unit === '$/bbl')
      return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
    return n.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 animate-fade-in">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header */}
          <div className="animate-reveal-up">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="data-label">{market.category}</span>
              <StatusBadge type="market" status={market.status} />
              {!isResolved && days <= 30 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-warning">
                  <Clock className="h-3 w-3" /> {days}d left
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight mb-1.5">{market.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{market.description}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
            <MetricCard
              label="Implied Value"
              value={fmtVal(implied)}
              sub={market.unit}
              tooltip="The market's best estimate for the final value, derived from the current contract price."
              highlight
            />
            <MetricCard
              label="Contract Price"
              value={formatPrice(market.currentPrice)}
              tooltip="Price of one contract in cents. Settles between 0¢ and 100¢."
            />
            <MetricCard label="24h Volume" value={formatCurrency(market.volume24h)} />
            <MetricCard label="Open Interest" value={formatCurrency(market.openInterest)} />
          </div>

          {/* Contract Range */}
          <div className="surface-card p-5 animate-reveal-up stagger-2 glow-accent">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold">Contract Range</h2>
              <InfoTip content="The payoff is determined by where the final value lands within this range. Below the floor = 0¢, above the cap = 100¢, between = linear." />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-center min-w-[60px]">
                <p className="data-label mb-1">Floor</p>
                <p className="text-lg font-bold font-mono tabular-nums text-negative">
                  {fmtVal(market.lowerBound)}
                </p>
                <p className="text-[10px] text-muted-foreground">{market.unit}</p>
              </div>
              <div className="flex-1">
                <div className="range-track h-3">
                  <div className="range-fill h-full" style={{ width: `${clamp(market.currentPrice * 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/60">0¢</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Implied: <span className="text-warning font-semibold">{fmtVal(implied)}</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">100¢</span>
                </div>
              </div>
              <div className="text-center min-w-[60px]">
                <p className="data-label mb-1">Cap</p>
                <p className="text-lg font-bold font-mono tabular-nums text-positive">
                  {fmtVal(market.upperBound)}
                </p>
                <p className="text-[10px] text-muted-foreground">{market.unit}</p>
              </div>
            </div>

            {market.referenceValue !== undefined && (
              <div className="text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
                Current reference: <span className="font-mono font-semibold text-foreground">{fmtVal(market.referenceValue)} {market.unit}</span>
                <InfoTip content="The latest observed value. The contract settles based on the value on the resolution date, not the current reference." />
              </div>
            )}
          </div>

          {/* Payoff chart */}
          <div className="surface-card p-5 animate-reveal-up stagger-3">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold">Payoff Structure</h2>
              {market.payoffCurve && market.payoffCurve.type !== 'linear' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-semibold">
                  {payoffCurveLabel(market.payoffCurve)}
                </span>
              )}
              <InfoTip content="Toggle between buyer and seller views to see how payoff changes for each side. Buyer profits when value is higher, seller when lower." />
            </div>
            <PayoffChart
              lower={market.lowerBound}
              upper={market.upperBound}
              currentPrice={market.currentPrice}
              unit={market.unit}
              resolvedValue={market.resolvedValue}
              referenceValue={market.referenceValue}
              height={280}
              curve={market.payoffCurve}
            />
          </div>

          {/* Contract details */}
          <div className="surface-card p-5 animate-reveal-up stagger-4">
            <h2 className="text-sm font-semibold mb-4">Contract Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <DetailItem label="Variable" value={market.variable} />
              <DetailItem label="Unit" value={market.unit || '—'} />
              <DetailItem label="Range Floor" value={`${market.lowerBound.toLocaleString()} ${market.unit}`} mono />
              <DetailItem label="Range Cap" value={`${market.upperBound.toLocaleString()} ${market.unit}`} mono />
              <DetailItem
                label="Resolution Date"
                value={new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                icon={<Calendar className="h-3 w-3" />}
              />
              <DetailItem label="Settlement Source" value={market.settlementSource} />
              {market.resolvedValue !== undefined && (
                <>
                  <DetailItem label="Settled Value" value={`${fmtVal(market.resolvedValue)} ${market.unit}`} mono highlight />
                  <DetailItem label="Final Payoff" value={`${((resolvedPayoff ?? 0) * 100).toFixed(1)}¢`} mono highlight />
                </>
              )}
            </div>
          </div>

          {/* How settlement works */}
          <div className="surface-card p-5 animate-reveal-up stagger-5">
            <ContractExplainer market={market} />
          </div>

          {/* Discussion */}
          <div className="surface-card p-5 animate-reveal-up stagger-6">
            <Comments marketId={market.id} />
          </div>

          {/* Order book + trades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-reveal-up stagger-6">
            <div className="surface-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <h3 className="text-sm font-semibold">Order Book</h3>
                <InfoTip content="Shows pending buy (bid) and sell (ask) orders. The spread is the gap between the best bid and ask." />
              </div>
              {orderBook && <OrderBookComponent orderBook={orderBook} />}
            </div>
            <div className="surface-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold">Recent Trades</h3>
              </div>
              <TradeHistory trades={trades} />
            </div>
          </div>
        </div>

        {/* ── Right column: trade panel ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Price hero */}
          <div className="surface-card p-5 glow-accent animate-reveal-up stagger-1">
            <div className="text-center mb-4">
              <p className="data-label mb-1.5">
                Implied Value
                <InfoTip content="The market's consensus estimate for the final value, based on the current contract price and the range." />
              </p>
              <p className="text-[36px] font-bold font-mono tabular-nums leading-none">{fmtVal(implied)}</p>
              <p className="text-xs text-muted-foreground mt-1">{market.unit}</p>
            </div>

            {/* Range */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                  {fmtVal(market.lowerBound)}
                </span>
                <div className="flex-1 range-track">
                  <div className="range-fill" style={{ width: `${clamp(market.currentPrice * 100)}%` }} />
                </div>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                  {fmtVal(market.upperBound)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">Range · {market.unit}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-secondary/60 rounded-lg py-2.5">
                <p className="data-label mb-0.5">Price</p>
                <p className="data-value text-foreground">{formatPrice(market.currentPrice)}</p>
              </div>
              <div className="bg-secondary/60 rounded-lg py-2.5">
                <p className="data-label mb-0.5">Volume</p>
                <p className="data-value text-foreground">{formatCurrency(market.totalVolume)}</p>
              </div>
            </div>
          </div>

          {/* Trade panel */}
          {!isResolved && (
            <div className="surface-card p-5 animate-reveal-up stagger-2">
              <h3 className="text-sm font-semibold mb-4">Trade</h3>
              <TradePanel market={market} />
            </div>
          )}

          {isResolved && (
            <div className="surface-card p-5 animate-reveal-up stagger-2">
              <div className="text-center space-y-2">
                <p className="data-label">Market Resolved</p>
                <p className="text-3xl font-bold font-mono tabular-nums text-positive">
                  {((resolvedPayoff ?? 0) * 100).toFixed(1)}¢
                </p>
                <p className="text-xs text-muted-foreground">Final payoff per contract</p>
                <div className="mt-3 text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3">
                  Settled at <span className="font-mono font-semibold text-foreground">{fmtVal(market.resolvedValue!)} {market.unit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, tooltip, highlight }: {
  label: string; value: string; sub?: string; tooltip?: string; highlight?: boolean;
}) {
  return (
    <div className={cn('surface-card px-4 py-3', highlight && 'glow-accent border-primary/20')}>
      <p className="data-label mb-0.5">
        {label}
        {tooltip && <InfoTip content={tooltip} />}
      </p>
      <p className={cn('text-lg font-bold font-mono tabular-nums', highlight && 'text-primary')}>
        {value}
        {sub && <span className="text-xs font-normal text-muted-foreground ml-1">{sub}</span>}
      </p>
    </div>
  );
}

function DetailItem({ label, value, mono, highlight, icon }: {
  label: string; value: string; mono?: boolean; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="data-label mb-0.5">{label}</p>
      <p className={cn('text-sm', mono && 'font-mono tabular-nums', highlight && 'text-positive font-semibold')}>
        {icon && <span className="inline-flex mr-1 align-middle">{icon}</span>}
        {value}
      </p>
    </div>
  );
}

function clamp(n: number) { return Math.min(100, Math.max(0, n)); }
