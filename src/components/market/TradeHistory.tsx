import { Trade, formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="text-xs px-3 py-8 text-center text-muted-foreground">
        <p className="font-semibold mb-1">No trades yet</p>
        <p className="text-[11px]">Executed trades will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 data-label border-b border-border/50">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Side</span>
        <span className="text-right">Time</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {trades.map((trade) => (
          <div key={trade.id} className="grid grid-cols-4 gap-2 px-3 py-[5px] border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
            <span className={cn('font-mono tabular-nums', trade.side === 'buy' ? 'text-positive' : 'text-negative')}>
              {formatPrice(trade.price)}
            </span>
            <span className="font-mono tabular-nums text-right text-secondary-foreground">{trade.quantity}</span>
            <span className={cn('text-right font-semibold uppercase tracking-wider', trade.side === 'buy' ? 'text-positive' : 'text-negative')}>
              {trade.side}
            </span>
            <span className="text-right text-muted-foreground font-mono tabular-nums">
              {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
