import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Market, formatPrice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import InfoTip from '@/components/shared/InfoTip';
import { cn } from '@/lib/utils';
import { usePlaceOrder } from '@/hooks/use-trading';
import { useAuth } from '@/hooks/use-auth';
import { useUserBalance } from '@/hooks/use-user-balance';
import { isUuid } from '@/lib/uuid';
import { Loader2, Wallet, Info } from 'lucide-react';

interface TradePanelProps {
  market: Market;
}

export default function TradePanel({ market }: TradePanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('10');
  const [limitPrice, setLimitPrice] = useState((market.currentPrice * 100).toFixed(1));
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const placeOrder = usePlaceOrder();

  const price = orderType === 'market' ? market.currentPrice : Number(limitPrice) / 100;
  const effectivePrice = side === 'buy' ? price : 1 - price;
  const cost = Number(quantity) * effectivePrice;
  const availableBalance = balance?.amount ?? 0;
  const insufficientFunds = !!user && cost > availableBalance;
  const isDemoMarket = !isUuid(market.id);

  const handleSubmit = () => {
    if (!user) {
      // Could show auth modal here
      return;
    }

    placeOrder.mutate({
      market_id: market.id,
      side,
      order_type: orderType,
      quantity: Number(quantity),
      price: Number(price.toFixed(4)),
    });
  };

  return (
    <div className="space-y-4">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'py-3 text-sm font-bold rounded-lg transition-all duration-150 active:scale-[0.97]',
            side === 'buy'
              ? 'bg-positive text-primary-foreground shadow-lg shadow-positive/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          )}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'py-3 text-sm font-bold rounded-lg transition-all duration-150 active:scale-[0.97]',
            side === 'sell'
              ? 'bg-negative text-destructive-foreground shadow-lg shadow-negative/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          )}
        >
          SELL
        </button>
      </div>

      {/* Order type */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        <button
          onClick={() => setOrderType('market')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all',
            orderType === 'market' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all',
            orderType === 'limit' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          Limit
        </button>
      </div>

      {/* Limit price */}
      {orderType === 'limit' && (
        <div>
          <label className="data-label block mb-1.5">
            Price (¢)
            <InfoTip content="The price in cents you're willing to pay per contract. Contracts pay out 0¢ to 100¢ at settlement." />
          </label>
          <input
            type="number" min="0.1" max="99.9" step="0.1"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full h-10 px-3 rounded-lg surface-inset text-sm font-mono tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="data-label block mb-1.5">
          Contracts
          <InfoTip content="Each contract pays between 0¢ and 100¢ depending on where the final value lands in the range." />
        </label>
        <input
          type="number" min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full h-10 px-3 rounded-lg surface-inset text-sm font-mono tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <div className="flex gap-1.5 mt-2">
          {[10, 50, 100, 500].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(String(q))}
              className={cn(
                'flex-1 py-1.5 text-[10px] font-semibold rounded-md border transition-colors active:scale-95',
                quantity === String(q)
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border hover:bg-secondary/60 text-muted-foreground'
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Cost summary */}
      <div className="space-y-2 py-3 border-t border-b border-border/50 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Price per contract
            <InfoTip
              content={side === 'buy'
                ? "Your cost per contract. Pays 0¢–100¢ at settlement."
                : "As a seller, your cost is (100¢ − price). You profit if the value lands below the implied level."}
              side="left"
            />
          </span>
          <span className="data-value text-foreground">{formatPrice(effectivePrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contracts</span>
          <span className="data-value text-foreground">{quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated cost</span>
          <span className="data-value text-foreground text-[13px]">${(cost).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Max payout
            <InfoTip
              content={side === 'buy'
                ? "If the value settles at the cap, each contract pays 100¢."
                : "If the value settles at the floor, each contract pays 100¢ to the seller."}
              side="left"
            />
          </span>
          <span className="data-value text-positive text-[13px]">${(Number(quantity)).toFixed(2)}</span>
        </div>
      </div>

      {/* Balance + submit */}
      {!user ? (
        <p className="text-xs text-center text-muted-foreground py-2">
          Sign in to start trading
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Available
            </span>
            <span className="font-mono tabular-nums text-foreground font-semibold">
              ${availableBalance.toFixed(2)}
            </span>
          </div>

          {insufficientFunds && !isDemoMarket && (
            <p className="text-[11px] text-center text-destructive px-1">
              Insufficient balance.{' '}
              <Link to="/wallet" className="underline font-semibold hover:text-destructive/80">
                Deposit funds
              </Link>
            </p>
          )}

          {isDemoMarket && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-warning/30 bg-warning/5 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <span>
                Demo market — trading is disabled. Visit a live market from{' '}
                <Link to="/explore" className="underline font-semibold text-foreground">
                  Explore
                </Link>{' '}
                to place real orders.
              </span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={
              placeOrder.isPending ||
              Number(quantity) <= 0 ||
              insufficientFunds ||
              isDemoMarket
            }
            className={cn(
              'w-full h-11 font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.97]',
              side === 'buy'
                ? 'bg-positive hover:bg-positive/90 text-primary-foreground shadow-lg shadow-positive/15'
                : 'bg-negative hover:bg-negative/90 text-destructive-foreground shadow-lg shadow-negative/15'
            )}
          >
            {placeOrder.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isDemoMarket ? (
              'TRADING DISABLED'
            ) : (
              `${side === 'buy' ? 'BUY' : 'SELL'} ${quantity} CONTRACTS`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
