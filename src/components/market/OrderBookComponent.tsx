import { OrderBook as OrderBookType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OrderBookProps {
  orderBook: OrderBookType;
}

export default function OrderBookComponent({ orderBook }: OrderBookProps) {
  const maxTotal = Math.max(
    orderBook.bids[orderBook.bids.length - 1]?.total ?? 0,
    orderBook.asks[orderBook.asks.length - 1]?.total ?? 0,
  );

  return (
    <div className="text-xs">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed so lowest ask is at bottom) */}
      <div className="border-b">
        {[...orderBook.asks].reverse().map((level, i) => (
          <div key={`a-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1.5 relative">
            <div
              className="absolute inset-y-0 right-0 bg-negative/6"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="font-mono tabular-nums text-negative relative">{(level.price * 100).toFixed(1)}¢</span>
            <span className="font-mono tabular-nums text-right relative">{level.size}</span>
            <span className="font-mono tabular-nums text-right text-muted-foreground relative">{level.total}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-3 py-2 text-center text-[10px] text-muted-foreground border-b bg-secondary/30">
        Spread: <span className="font-mono tabular-nums font-medium">{(orderBook.spread * 100).toFixed(1)}¢</span>
      </div>

      {/* Bids */}
      <div>
        {orderBook.bids.map((level, i) => (
          <div key={`b-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1.5 relative">
            <div
              className="absolute inset-y-0 right-0 bg-positive/6"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="font-mono tabular-nums text-positive relative">{(level.price * 100).toFixed(1)}¢</span>
            <span className="font-mono tabular-nums text-right relative">{level.size}</span>
            <span className="font-mono tabular-nums text-right text-muted-foreground relative">{level.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
