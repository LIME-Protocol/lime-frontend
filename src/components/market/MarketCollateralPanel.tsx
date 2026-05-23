import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, RotateCcw, Trophy, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Market } from '@/lib/types';
import {
  useClaimPayout,
  useDepositCollateral,
  useMarketAvailableCollateral,
  useRefundIfCancelled,
  useWithdrawAvailableCollateral,
} from '@/hooks/use-market-collateral';
import type { PositionSide } from '@/services/wallet';

interface MarketCollateralPanelProps {
  market: Market;
}

function sideLabel(side: PositionSide) {
  return side === 'long' ? 'Long' : 'Short';
}

export default function MarketCollateralPanel({ market }: MarketCollateralPanelProps) {
  const [amount, setAmount] = useState('25');
  const { publicKey } = useWallet();
  const walletModal = useWalletModal();
  const availableCollateral = useMarketAvailableCollateral(market.onchainMarketId);
  const deposit = useDepositCollateral(market.onchainMarketId);
  const withdraw = useWithdrawAvailableCollateral(market.onchainMarketId);
  const claim = useClaimPayout(market.onchainMarketId);
  const refund = useRefundIfCancelled(market.onchainMarketId);

  const numericAmount = Number(amount);
  const hasWallet = Boolean(publicKey);
  const hasOnchainMarket = Boolean(market.onchainMarketId);
  const isActive = market.status === 'active';
  const isClaimable = market.status === 'resolved' || market.status === 'settled';
  const isRefundable = market.status === 'cancelled' || market.status === 'invalidated' || market.status === 'invalid';
  const amountInvalid = !Number.isFinite(numericAmount) || numericAmount <= 0;

  const handleDeposit = () => deposit.mutate(numericAmount);
  const handleWithdraw = () => withdraw.mutate(numericAmount);
  const handleSideAction = (side: PositionSide) => {
    if (isClaimable) claim.mutate(side);
    if (isRefundable) refund.mutate(side);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Market Collateral</h3>
        </div>
        {market.onchainMarketId && (
          <span className="rounded-md bg-secondary/70 px-2 py-1 text-[10px] font-mono text-muted-foreground">
            #{market.onchainMarketId}
          </span>
        )}
      </div>

      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="data-label mb-1">Available Collateral</p>
        <p className="text-2xl font-bold font-mono tabular-nums">
          {availableCollateral.isLoading ? '...' : `$${(availableCollateral.data ?? 0).toFixed(2)}`}
        </p>
      </div>

      {!hasOnchainMarket && (
        <p className="text-[11px] text-muted-foreground">
          This Market is visible, but on-chain actions are disabled until it is linked to a Program market.
        </p>
      )}

      {hasOnchainMarket && !hasWallet && (
        <Button type="button" variant="secondary" className="w-full" onClick={() => walletModal.setVisible(true)}>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      )}

      {hasOnchainMarket && hasWallet && isActive && (
        <div className="space-y-3">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label="Collateral amount"
            className="font-mono tabular-nums"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" onClick={handleDeposit} disabled={amountInvalid || deposit.isPending}>
              {deposit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
              Deposit
            </Button>
            <Button type="button" variant="outline" onClick={handleWithdraw} disabled={amountInvalid || withdraw.isPending}>
              {withdraw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
              Withdraw
            </Button>
          </div>
        </div>
      )}

      {hasOnchainMarket && hasWallet && (isClaimable || isRefundable) && (
        <div className="grid grid-cols-2 gap-2">
          {(['long', 'short'] as PositionSide[]).map((side) => (
            <Button
              key={side}
              type="button"
              variant={isClaimable ? 'default' : 'outline'}
              onClick={() => handleSideAction(side)}
              disabled={claim.isPending || refund.isPending}
            >
              {isClaimable ? <Trophy className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              {isClaimable ? 'Claim' : 'Refund'} {sideLabel(side)}
            </Button>
          ))}
        </div>
      )}

      {hasOnchainMarket && market.status === 'pending_resolution' && (
        <p className="text-[11px] text-muted-foreground">
          Trading and collateral actions pause while this Market is pending resolution.
        </p>
      )}
    </div>
  );
}
