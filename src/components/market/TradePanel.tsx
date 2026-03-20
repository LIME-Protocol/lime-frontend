import { useState } from 'react';
import { Market, formatPrice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TradePanelProps {
  market: Market;
}

export default function TradePanel({ market }: TradePanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('10');
  const [limitPrice, setLimitPrice] = useState((market.currentPrice * 100).toFixed(1));

  const price = orderType === 'market' ? market.currentPrice : Number(limitPrice) / 100;
  const cost = Number(quantity) * (side === 'buy' ? price : 1 - price);

  return (
    <div className="space-y-4">
      {/* Buy / Sell toggle */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 active:scale-[0.97]',
            side === 'buy'
              ? 'bg-positive text-positive-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 active:scale-[0.97]',
            side === 'sell'
              ? 'bg-negative text-negative-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="flex rounded-md bg-secondary/50 p-0.5">
        <button
          onClick={() => setOrderType('market')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-medium rounded transition-all',
            orderType === 'market' ? 'bg-card shadow-sm' : 'text-muted-foreground'
          )}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-medium rounded transition-all',
            orderType === 'limit' ? 'bg-card shadow-sm' : 'text-muted-foreground'
          )}
        >
          Limit
        </button>
      </div>

      {/* Limit price */}
      {orderType === 'limit' && (
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">Price (¢)</label>
          <input
            type="number"
            min="0.1"
            max="99.9"
            step="0.1"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border bg-background text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-[11px] text-muted-foreground mb-1">Contracts</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border bg-background text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <div className="flex gap-1.5 mt-1.5">
          {[10, 50, 100, 500].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(String(q))}
              className="flex-1 py-1 text-[10px] font-medium rounded border hover:bg-secondary/60 transition-colors active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Cost summary */}
      <div className="space-y-1.5 py-3 border-t border-b text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price per contract</span>
          <span className="font-mono tabular-nums font-medium">{formatPrice(price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contracts</span>
          <span className="font-mono tabular-nums font-medium">{quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated cost</span>
          <span className="font-mono tabular-nums font-semibold">${(cost * 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Max payout</span>
          <span className="font-mono tabular-nums font-semibold text-positive">${(Number(quantity) * 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Submit */}
      <Button
        className={cn(
          'w-full font-semibold transition-all duration-150 active:scale-[0.97]',
          side === 'buy'
            ? 'bg-positive hover:bg-positive/90 text-positive-foreground'
            : 'bg-negative hover:bg-negative/90 text-negative-foreground'
        )}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {quantity} contracts
      </Button>
    </div>
  );
}
