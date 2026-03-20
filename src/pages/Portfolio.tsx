import { useState } from 'react';
import { Link } from 'react-router-dom';
import { positions, orders, markets } from '@/lib/mock-data';
import { formatPrice, formatCurrency, calculatePayoff } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import InfoTip from '@/components/shared/InfoTip';
import { cn } from '@/lib/utils';
import { Briefcase, History, FileText } from 'lucide-react';

type Tab = 'positions' | 'resolved' | 'orders';

export default function Portfolio() {
  const [tab, setTab] = useState<Tab>('positions');

  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice * 100, 0);
  const resolvedPositions = markets.filter((m) => m.status === 'resolved');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'positions', label: 'Open Positions', icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: 'resolved', label: 'Resolved', icon: <FileText className="h-3.5 w-3.5" /> },
    { key: 'orders', label: 'Order History', icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-[22px] font-bold mb-1">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Your positions, resolved markets, and order history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
        <SummaryCard label="Open Positions" value={String(positions.length)} />
        <SummaryCard label="Portfolio Value" value={`$${totalValue.toFixed(0)}`} />
        <SummaryCard label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(1)}`} valueClass={totalPnl >= 0 ? 'text-positive' : 'text-negative'} />
        <SummaryCard label="Open Orders" value={String(orders.filter(o => o.status === 'open').length)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border animate-reveal-up stagger-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Positions tab */}
      {tab === 'positions' && (
        <div className="space-y-3 animate-fade-in">
          {positions.length === 0 ? (
            <EmptyState title="No open positions" description="Start trading to see your positions here" />
          ) : (
            positions.map((pos, i) => (
              <Link
                key={pos.id}
                to={`/market/${pos.marketId}`}
                className="block surface-card-hover p-5 animate-reveal-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
                        pos.side === 'long' ? 'bg-positive-soft text-positive-foreground' : 'bg-negative-soft text-negative-foreground'
                      )}>
                        {pos.side === 'long' ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="data-label">{pos.market.category}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold mb-2">{pos.market.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span>Qty: <span className="data-value text-foreground">{pos.quantity}</span></span>
                      <span>Avg: <span className="data-value text-foreground">{formatPrice(pos.avgPrice)}</span></span>
                      <span>Current: <span className="data-value text-foreground">{formatPrice(pos.currentPrice)}</span></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-lg font-bold font-mono tabular-nums', pos.pnl >= 0 ? 'text-positive' : 'text-negative')}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(1)}
                    </p>
                    <p className={cn('text-xs font-mono tabular-nums', pos.pnl >= 0 ? 'text-positive/70' : 'text-negative/70')}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Resolved tab */}
      {tab === 'resolved' && (
        <div className="space-y-3 animate-fade-in">
          {resolvedPositions.length === 0 ? (
            <EmptyState title="No resolved positions" description="Your resolved markets will appear here" />
          ) : (
            resolvedPositions.map((m, i) => {
              const payoff = m.resolvedValue !== undefined ? calculatePayoff(m.resolvedValue, m.lowerBound, m.upperBound) : 0;
              return (
                <Link key={m.id} to={`/market/${m.id}`}
                  className="block surface-card-hover p-5 animate-reveal-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge type="market" status="resolved" />
                        <span className="data-label">{m.category}</span>
                      </div>
                      <h3 className="text-[13px] font-semibold mb-1">{m.title}</h3>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Settled: <span className="data-value text-foreground">{m.resolvedValue} {m.unit}</span></span>
                        <span>Range: <span className="font-mono tabular-nums">{m.lowerBound}–{m.upperBound}</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold font-mono tabular-nums text-positive">{(payoff * 100).toFixed(1)}¢</p>
                      <p className="data-label">Payoff</p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="surface-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 data-label">Market</th>
                  <th className="text-center px-4 py-3 data-label">Side</th>
                  <th className="text-center px-4 py-3 data-label">Type</th>
                  <th className="text-right px-4 py-3 data-label">Price</th>
                  <th className="text-right px-4 py-3 data-label">Qty</th>
                  <th className="text-right px-4 py-3 data-label">Filled</th>
                  <th className="text-center px-4 py-3 data-label">Status</th>
                  <th className="text-right px-4 py-3 data-label hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{o.marketTitle}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-bold uppercase', o.side === 'buy' ? 'text-positive' : 'text-negative')}>{o.side}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground capitalize">{o.type}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatPrice(o.price)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{o.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{o.filled}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge type="order" status={o.status} /></td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="surface-card px-4 py-3">
      <p className="data-label mb-0.5">{label}</p>
      <p className={cn('text-lg font-bold font-mono tabular-nums', valueClass)}>{value}</p>
    </div>
  );
}
