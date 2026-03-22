import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { usePositions, useUserOrders, useUserTrades } from '@/hooks/use-portfolio';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import LoadingState from '@/components/shared/LoadingState';
import { cn } from '@/lib/utils';
import { Briefcase, History, FileText, Activity, Loader2 } from 'lucide-react';

type Tab = 'positions' | 'orders' | 'trades';

export default function Portfolio() {
  const { user, loading: authLoading } = useAuth();
  const { data: positions = [], isLoading: posLoading } = usePositions();
  const { data: userOrders = [], isLoading: ordLoading } = useUserOrders();
  const { data: userTrades = [], isLoading: trLoading } = useUserTrades();
  const [tab, setTab] = useState<Tab>('positions');

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/auth" replace />;

  const isLoading = posLoading || ordLoading || trLoading;

  const totalPnl = positions.reduce((s: number, p: any) => s + (p.estimated_pnl || 0), 0);
  const totalExposure = positions.reduce((s: number, p: any) => s + Math.abs(p.net_quantity) * p.average_price * 100, 0);
  const openOrders = userOrders.filter((o: any) => o.status === 'open' || o.status === 'partial');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'positions', label: 'Open Positions', icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: 'orders', label: 'Orders', icon: <FileText className="h-3.5 w-3.5" /> },
    { key: 'trades', label: 'Trades', icon: <Activity className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-[22px] font-bold mb-1">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Your positions, orders, and trade history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-reveal-up stagger-1">
        <SummaryCard label="Open Positions" value={String(positions.length)} />
        <SummaryCard label="Exposure" value={`$${totalExposure.toFixed(0)}`} />
        <SummaryCard
          label="Est. P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          valueClass={totalPnl >= 0 ? 'text-positive' : 'text-negative'}
        />
        <SummaryCard label="Open Orders" value={String(openOrders.length)} />
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Positions */}
          {tab === 'positions' && (
            <div className="space-y-3 animate-fade-in">
              {positions.length === 0 ? (
                <EmptyState title="No open positions" description="Start trading to see your positions here" />
              ) : (
                <div className="surface-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-3 data-label">Market</th>
                          <th className="text-right px-4 py-3 data-label">Qty</th>
                          <th className="text-right px-4 py-3 data-label">Avg Price</th>
                          <th className="text-right px-4 py-3 data-label">Current</th>
                          <th className="text-right px-4 py-3 data-label">Value</th>
                          <th className="text-right px-4 py-3 data-label">P&L</th>
                          <th className="text-center px-4 py-3 data-label">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos: any) => {
                          const market = pos.markets;
                          const currentPrice = market?.current_reference_value
                            ? (Number(market.current_reference_value) - Number(market.lower_bound)) / (Number(market.upper_bound) - Number(market.lower_bound))
                            : 0.5;
                          const value = Math.abs(pos.net_quantity) * currentPrice * 100;
                          const pnl = pos.estimated_pnl || 0;

                          return (
                            <tr key={pos.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3">
                                <Link to={`/market/${pos.market_id}`} className="hover:text-primary transition-colors">
                                  <p className="text-[13px] font-medium">{market?.title || pos.market_id}</p>
                                  <p className="text-[11px] text-muted-foreground">{market?.category}</p>
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={cn(
                                  'font-mono tabular-nums text-xs font-semibold',
                                  pos.net_quantity > 0 ? 'text-positive' : 'text-negative'
                                )}>
                                  {pos.net_quantity > 0 ? '+' : ''}{pos.net_quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                                {(pos.average_price * 100).toFixed(1)}¢
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                                {(currentPrice * 100).toFixed(1)}¢
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                                ${value.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={cn('font-mono tabular-nums text-xs font-semibold', pnl >= 0 ? 'text-positive' : 'text-negative')}>
                                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge type="order" status={pos.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="surface-card overflow-hidden animate-fade-in">
              {userOrders.length === 0 ? (
                <div className="p-8">
                  <EmptyState title="No orders yet" description="Place your first order on a market" />
                </div>
              ) : (
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
                      {userOrders.map((o: any) => (
                        <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-[13px] font-medium">
                            <Link to={`/market/${o.market_id}`} className="hover:text-primary transition-colors">
                              {o.markets?.title || o.market_id}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn('text-xs font-bold uppercase', o.side === 'buy' ? 'text-positive' : 'text-negative')}>{o.side}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground capitalize">{o.order_type}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{(o.price * 100).toFixed(1)}¢</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{o.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{o.filled_quantity}</td>
                          <td className="px-4 py-3 text-center"><StatusBadge type="order" status={o.status} /></td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                            {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Trades */}
          {tab === 'trades' && (
            <div className="surface-card overflow-hidden animate-fade-in">
              {userTrades.length === 0 ? (
                <div className="p-8">
                  <EmptyState title="No trades yet" description="Your executed trades will appear here" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 data-label">Market</th>
                        <th className="text-center px-4 py-3 data-label">Side</th>
                        <th className="text-right px-4 py-3 data-label">Price</th>
                        <th className="text-right px-4 py-3 data-label">Qty</th>
                        <th className="text-right px-4 py-3 data-label hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTrades.map((t: any) => {
                        const isBuyer = t.buyer_user_id === user?.id;
                        return (
                          <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 text-[13px] font-medium">
                              <Link to={`/market/${t.market_id}`} className="hover:text-primary transition-colors">
                                {t.markets?.title || t.market_id}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn('text-xs font-bold uppercase', isBuyer ? 'text-positive' : 'text-negative')}>
                                {isBuyer ? 'BUY' : 'SELL'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{(t.price * 100).toFixed(1)}¢</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">{t.quantity}</td>
                            <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                              {new Date(t.executed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
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
