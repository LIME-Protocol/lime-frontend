import { Trade, formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="text-xs">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Side</span>
        <span className="text-right">Time</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {trades.map((trade) => (
          <div key={trade.id} className="grid grid-cols-4 gap-2 px-3 py-1.5 border-b last:border-0 hover:bg-secondary/20 transition-colors">
            <span className={cn(
              'font-mono tabular-nums',
              trade.side === 'buy' ? 'text-positive' : 'text-negative'
            )}>
              {formatPrice(trade.price)}
            </span>
            <span className="font-mono tabular-nums text-right">{trade.quantity}</span>
            <span className={cn(
              'text-right font-medium',
              trade.side === 'buy' ? 'text-positive' : 'text-negative'
            )}>
              {trade.side === 'buy' ? 'Buy' : 'Sell'}
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
