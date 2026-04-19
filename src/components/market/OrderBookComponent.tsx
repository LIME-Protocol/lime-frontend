import { OrderBook as OrderBookType } from '@/lib/types';
import InfoTip from '@/components/shared/InfoTip';

interface OrderBookProps {
  orderBook: OrderBookType;
}

export default function OrderBookComponent({ orderBook }: OrderBookProps) {
  const isEmpty = orderBook.bids.length === 0 && orderBook.asks.length === 0;

  if (isEmpty) {
    return (
      <div className="text-xs px-3 py-8 text-center text-muted-foreground">
        <p className="font-semibold mb-1">No open orders</p>
        <p className="text-[11px]">Be the first to place a limit order in this market.</p>
      </div>
    );
  }

  const maxTotal = Math.max(
    orderBook.bids[orderBook.bids.length - 1]?.total ?? 0,
    orderBook.asks[orderBook.asks.length - 1]?.total ?? 0,
    1,
  );

  const bestBid = orderBook.bids[0]?.price ?? 0;
  const bestAsk = orderBook.asks[0]?.price ?? 0;
  const midPrice = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : bestBid || bestAsk;

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

      {/* Spread + mid */}
      <div className="px-3 py-2 text-center data-label border-b border-border/50 bg-secondary/20 flex items-center justify-center gap-3">
        <span>
          Spread{' '}
          <span className="font-mono tabular-nums font-semibold text-foreground ml-1">
            {(orderBook.spread * 100).toFixed(1)}¢
          </span>
        </span>
        <span className="text-muted-foreground/60">|</span>
        <span>
          Mid{' '}
          <span className="font-mono tabular-nums font-semibold text-foreground ml-1">
            {(midPrice * 100).toFixed(1)}¢
          </span>
        </span>
        <InfoTip content="Spread = Best Ask − Best Bid. In linear contracts, buyer pays the ask price and seller's cost is (100¢ − bid price). The mid price is the average of the two." />
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
