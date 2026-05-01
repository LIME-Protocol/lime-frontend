import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUpRight, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestWithdrawal, type WithdrawMethod } from '@/hooks/use-withdraw';
import {
  useSavedDestinations,
  useSaveDestination,
  useDeleteDestination,
} from '@/hooks/use-saved-destinations';
import ConfirmWithdrawDialog from './ConfirmWithdrawDialog';

interface MethodOption {
  key: WithdrawMethod;
  label: string;
  hint: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  estimatedFee: number; // USD
}

const METHODS: MethodOption[] = [
  { key: 'PIX',  label: 'PIX',       hint: 'Brazil — instant',          destinationLabel: 'PIX key',        destinationPlaceholder: 'CPF, email or random key', estimatedFee: 0 },
  { key: 'USDC', label: 'USDC',      hint: 'ERC-20 / Solana',           destinationLabel: 'Wallet address', destinationPlaceholder: '0x… or Sol address',       estimatedFee: 1.0 },
  { key: 'BTC',  label: 'Bitcoin',   hint: 'On-chain — ~30 min',        destinationLabel: 'BTC address',    destinationPlaceholder: 'bc1q…',                    estimatedFee: 2.5 },
  { key: 'ETH',  label: 'Ethereum',  hint: 'On-chain — ~5 min',         destinationLabel: 'ETH address',    destinationPlaceholder: '0x…',                      estimatedFee: 1.5 },
  { key: 'WIRE', label: 'Bank wire', hint: 'ACH / SWIFT — 1-3 days',    destinationLabel: 'Bank details',   destinationPlaceholder: 'IBAN / routing + account', estimatedFee: 15 },
];

const HIGH_VALUE_THRESHOLD = 1000;

interface Props {
  availableUsd: number;
  dailyRemaining?: number;
  dailyLimit?: number;
}

export default function WithdrawForm({ availableUsd, dailyRemaining, dailyLimit }: Props) {
  const [method, setMethod] = useState<WithdrawMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const request = useRequestWithdrawal();
  const saveDest = useSaveDestination();
  const deleteDest = useDeleteDestination();
  const { data: savedDestinations = [] } = useSavedDestinations(method ?? undefined);

  const selected = METHODS.find((m) => m.key === method) ?? null;
  const numericAmount = Number(amount) || 0;
  const fee = selected?.estimatedFee ?? 0;
  const netReceived = Math.max(0, numericAmount - fee);

  const exceedsDaily = dailyRemaining !== undefined && numericAmount > dailyRemaining;

  const valid =
    !!selected &&
    numericAmount > 0 &&
    numericAmount <= availableUsd &&
    destination.trim().length > 0 &&
    !exceedsDaily;

  const isHighValue = numericAmount >= HIGH_VALUE_THRESHOLD;

  const submit = async () => {
    if (!selected || !valid) {
      toast.error('Fill all fields with a valid amount');
      return;
    }
    try {
      await request.mutateAsync({
        amount: numericAmount,
        currency: 'USD',
        method: selected.key,
        destination: destination.trim(),
      });
      // Save destination for reuse
      saveDest.mutate({
        method: selected.key,
        label: `${selected.label} · ${destination.trim().slice(0, 12)}…`,
        destination: destination.trim(),
      });
      toast.success(
        `Withdrawal requested — $${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} pending review.`,
      );
      setAmount('');
      setDestination('');
      setMethod(null);
      setConfirmOpen(false);
    } catch (err) {
      toast.error((err as Error).message ?? 'Withdrawal failed');
    }
  };

  const handleSubmitClick = () => {
    if (!valid) return;
    if (isHighValue) {
      setConfirmOpen(true);
    } else {
      submit();
    }
  };

  const dailyUsedPct = useMemo(() => {
    if (!dailyLimit) return 0;
    return Math.min(100, ((dailyLimit - (dailyRemaining ?? dailyLimit)) / dailyLimit) * 100);
  }, [dailyLimit, dailyRemaining]);

  return (
    <div className="space-y-4">
      {/* Daily limit indicator */}
      {dailyLimit !== undefined && dailyRemaining !== undefined && (
        <div className="surface-card p-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Daily withdraw limit</span>
            <span className="font-mono tabular-nums text-foreground">
              ${(dailyLimit - dailyRemaining).toFixed(2)} / ${dailyLimit.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                dailyUsedPct > 80 ? 'bg-warning' : 'bg-primary',
              )}
              style={{ width: `${dailyUsedPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMethod(m.key); setDestination(''); }}
            className={cn(
              'surface-card p-4 text-left transition-all active:scale-[0.97]',
              method === m.key
                ? 'border-primary/40 ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/20',
            )}
          >
            <p className="text-[13px] font-semibold mb-1">{m.label}</p>
            <p className="text-[10px] text-muted-foreground">{m.hint}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="surface-card p-5 animate-scale-in space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-negative" />
            Withdraw via {selected.label}
          </h3>

          {/* Saved destinations */}
          {savedDestinations.length > 0 && (
            <div className="space-y-2">
              <label className="data-label flex items-center gap-1.5">
                <Star className="h-3 w-3" /> Saved destinations
              </label>
              <div className="flex flex-wrap gap-2">
                {savedDestinations.map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      'group flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full border text-[11px] font-mono transition-colors',
                      destination === d.destination
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <button onClick={() => setDestination(d.destination)} className="truncate max-w-[180px]">
                      {d.destination.slice(0, 18)}…
                    </button>
                    <button
                      onClick={() => deleteDest.mutate(d.id)}
                      className="p-1 rounded-full hover:bg-destructive/15 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete saved destination"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="data-label">{selected.destinationLabel}</label>
            <Input
              type="text"
              placeholder={selected.destinationPlaceholder}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-secondary/50 border-border font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="data-label">Amount (USD)</label>
              <span className="text-[10px] text-muted-foreground font-mono">
                Available: ${availableUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                <Input
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-secondary/50 border-border font-mono"
                  min="1"
                  max={availableUsd}
                  step="0.01"
                />
              </div>
              <Button
                onClick={handleSubmitClick}
                disabled={!valid || request.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]"
              >
                {request.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isHighValue ? (
                  'Review & confirm'
                ) : (
                  'Request withdrawal'
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setAmount(((availableUsd * pct) / 100).toFixed(2))}
                  className="px-3 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {exceedsDaily && (
            <p className="text-[11px] text-destructive">
              Exceeds daily limit (${dailyRemaining?.toFixed(2)} remaining today).
            </p>
          )}

          {/* Cost summary */}
          {numericAmount > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-border/50 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono text-foreground">${numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network fee (est.)</span>
                <span className="font-mono text-muted-foreground">−${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/50">
                <span className="text-foreground font-semibold">You'll receive</span>
                <span className="font-mono font-bold text-foreground">${netReceived.toFixed(2)}</span>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Withdrawals are reviewed by our team and typically processed within 24 hours.
            The amount is debited from your balance immediately and refunded if cancelled or rejected.
          </p>
        </div>
      )}

      {selected && (
        <ConfirmWithdrawDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          amount={numericAmount}
          method={selected.label}
          destination={destination}
          onConfirm={submit}
          loading={request.isPending}
        />
      )}
    </div>
  );
}
