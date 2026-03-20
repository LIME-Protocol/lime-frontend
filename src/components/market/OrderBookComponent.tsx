import { OrderBook as OrderBookType } from '@/lib/types';

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
      <div className="grid grid-cols-3 gap-2 px-3 py-2 data-label border-b border-border/50">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      {/* Asks reversed */}
      <div className="border-b border-border/50">
        {[...orderBook.asks].reverse().map((level, i) => (
          <div key={`a-${i}`} className="grid grid-cols-3 gap-2 px-3 py-[5px] relative">
            <div className="absolute inset-y-0 right-0 bg-negative/8" style={{ width: `${(level.total / maxTotal) * 100}%` }} />
            <span className="font-mono tabular-nums text-negative relative">{(level.price * 100).toFixed(1)}¢</span>
            <span className="font-mono tabular-nums text-right relative text-secondary-foreground">{level.size}</span>
            <span className="font-mono tabular-nums text-right text-muted-foreground relative">{level.total}</span>
          </div>
        ))}
      </div>
      {/* Spread */}
      <div className="px-3 py-2 text-center data-label border-b border-border/50 bg-secondary/20">
        Spread <span className="font-mono tabular-nums font-semibold text-foreground ml-1">{(orderBook.spread * 100).toFixed(1)}¢</span>
      </div>
      {/* Bids */}
      <div>
        {orderBook.bids.map((level, i) => (
          <div key={`b-${i}`} className="grid grid-cols-3 gap-2 px-3 py-[5px] relative">
            <div className="absolute inset-y-0 right-0 bg-positive/8" style={{ width: `${(level.total / maxTotal) * 100}%` }} />
            <span className="font-mono tabular-nums text-positive relative">{(level.price * 100).toFixed(1)}¢</span>
            <span className="font-mono tabular-nums text-right relative text-secondary-foreground">{level.size}</span>
            <span className="font-mono tabular-nums text-right text-muted-foreground relative">{level.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
