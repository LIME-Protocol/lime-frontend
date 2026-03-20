import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { markets, generateOrderBook, generateTrades } from '@/lib/mock-data';
import { impliedValue, formatCurrency, formatPrice, calculatePayoff, daysUntil } from '@/lib/types';
import PayoffChart from '@/components/market/PayoffChart';
import OrderBookComponent from '@/components/market/OrderBookComponent';
import TradeHistory from '@/components/market/TradeHistory';
import TradePanel from '@/components/market/TradePanel';
import ContractExplainer from '@/components/market/ContractExplainer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketDetail() {
  const { id } = useParams();
  const market = markets.find((m) => m.id === id);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');

  const orderBook = useMemo(() => market ? generateOrderBook(market.currentPrice) : null, [market]);
  const trades = useMemo(() => market ? generateTrades(market.id, market.currentPrice) : [], [market]);

  if (!market) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Market not found</p>
        <Link to="/" className="text-accent text-sm mt-2 inline-block hover:underline">Back to Explore</Link>
      </div>
    );
  }

  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const isResolved = market.status === 'resolved';
  const days = daysUntil(market.resolutionDate);
  const resolvedPayoff = market.resolvedValue !== undefined
    ? calculatePayoff(market.resolvedValue, market.lowerBound, market.upperBound) : undefined;

  const fmtImplied = (n: number) => {
    if (market.unit === 'pts' || market.unit === '$' || market.unit === '$/oz' || market.unit === '$/bbl') {
      return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
    }
    return n.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 animate-fade-in">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left column: market info ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header */}
          <div className="animate-reveal-up">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[11px]">{market.category}</Badge>
              <StatusBadge type="market" status={market.status} />
              {!isResolved && days <= 30 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-warning">
                  <Clock className="h-3 w-3" /> {days}d left
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight mb-1.5">{market.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{market.description}</p>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
            <MetricCard label="Implied Value" value={fmtImplied(implied)} sub={market.unit} />
            <MetricCard label="Contract Price" value={formatPrice(market.currentPrice)} />
            <MetricCard label="24h Volume" value={formatCurrency(market.volume24h)} />
            <MetricCard label="Open Interest" value={formatCurrency(market.openInterest)} />
          </div>

          {/* Payoff chart */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-2">
            <h2 className="text-sm font-semibold mb-4">Payoff Structure</h2>
            <PayoffChart
              lower={market.lowerBound}
              upper={market.upperBound}
              currentPrice={market.currentPrice}
              unit={market.unit}
              resolvedValue={market.resolvedValue}
              referenceValue={market.referenceValue}
              height={280}
            />
          </div>

          {/* Contract details */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-3">
            <h2 className="text-sm font-semibold mb-4">Contract Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <Detail label="Variable" value={market.variable} />
              <Detail label="Unit" value={market.unit || '—'} />
              <Detail label="Lower Bound (L)" value={`${market.lowerBound.toLocaleString()} ${market.unit}`} mono />
              <Detail label="Upper Bound (U)" value={`${market.upperBound.toLocaleString()} ${market.unit}`} mono />
              <Detail
                label="Resolution Date"
                value={new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                icon={<Calendar className="h-3 w-3" />}
              />
              <Detail label="Settlement Source" value={market.settlementSource} />
              {market.referenceValue !== undefined && (
                <Detail label="Current Reference" value={`${fmtImplied(market.referenceValue)} ${market.unit}`} mono highlight />
              )}
              {market.resolvedValue !== undefined && (
                <>
                  <Detail label="Settled Value" value={`${fmtImplied(market.resolvedValue)} ${market.unit}`} mono highlight />
                  <Detail label="Final Payoff" value={`${((resolvedPayoff ?? 0) * 100).toFixed(1)}¢`} mono highlight />
                </>
              )}
            </div>
          </div>

          {/* Contract explainer */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-4">
            <ContractExplainer market={market} />
          </div>

          {/* Order book + trades (below chart on mobile, side-by-side on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-reveal-up stagger-5">
            <div className="surface-raised rounded-xl border overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold">Order Book</h3>
              </div>
              {orderBook && <OrderBookComponent orderBook={orderBook} />}
            </div>
            <div className="surface-raised rounded-xl border overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold">Recent Trades</h3>
              </div>
              <TradeHistory trades={trades} />
            </div>
          </div>
        </div>

        {/* ── Right column: trade panel ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Price card */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-1">
            <div className="text-center mb-4">
              <p className="text-[11px] text-muted-foreground mb-1">Implied Value</p>
              <p className="text-3xl font-bold font-mono tabular-nums">{fmtImplied(implied)}</p>
              <p className="text-xs text-muted-foreground">{market.unit}</p>
            </div>
            {/* Range visualization */}
            <div className="mb-3">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${market.currentPrice * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-mono text-muted-foreground">{market.lowerBound.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{market.upperBound.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-secondary/60 rounded-lg py-2">
                <p className="text-muted-foreground">Volume</p>
                <p className="font-mono font-semibold tabular-nums">{formatCurrency(market.totalVolume)}</p>
              </div>
              <div className="bg-secondary/60 rounded-lg py-2">
                <p className="text-muted-foreground">Trades 24h</p>
                <p className="font-mono font-semibold tabular-nums">{formatCurrency(market.volume24h)}</p>
              </div>
            </div>
          </div>

          {/* Trade panel */}
          {!isResolved && (
            <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-2">
              <h3 className="text-sm font-semibold mb-4">Trade</h3>
              <TradePanel market={market} />
            </div>
          )}

          {isResolved && (
            <div className="surface-raised rounded-xl border p-5 animate-reveal-up stagger-2">
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">This market has been resolved</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-positive">
                  {((resolvedPayoff ?? 0) * 100).toFixed(1)}¢
                </p>
                <p className="text-xs text-muted-foreground">Final payoff per contract</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="surface-raised rounded-xl border px-4 py-3">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-lg font-bold font-mono tabular-nums">
        {value}
        {sub && <span className="text-xs font-normal text-muted-foreground ml-1">{sub}</span>}
      </p>
    </div>
  );
}

function Detail({ label, value, mono, highlight, icon }: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className={cn(
        'text-sm',
        mono && 'font-mono tabular-nums',
        highlight && 'text-positive font-semibold',
      )}>
        {icon && <span className="inline-flex mr-1 align-middle">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
