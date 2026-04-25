import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestWithdrawal, type WithdrawMethod } from '@/hooks/use-withdraw';

interface MethodOption {
  key: WithdrawMethod;
  label: string;
  hint: string;
  destinationLabel: string;
  destinationPlaceholder: string;
}

const METHODS: MethodOption[] = [
  { key: 'PIX',  label: 'PIX',      hint: 'Brazil — instant',           destinationLabel: 'PIX key',           destinationPlaceholder: 'CPF, email or random key' },
  { key: 'USDC', label: 'USDC',     hint: 'ERC-20 / Solana',            destinationLabel: 'Wallet address',    destinationPlaceholder: '0x… or Sol address' },
  { key: 'BTC',  label: 'Bitcoin',  hint: 'On-chain — ~30 min',         destinationLabel: 'BTC address',       destinationPlaceholder: 'bc1q…' },
  { key: 'ETH',  label: 'Ethereum', hint: 'On-chain — ~5 min',          destinationLabel: 'ETH address',       destinationPlaceholder: '0x…' },
  { key: 'WIRE', label: 'Bank wire', hint: 'ACH / SWIFT — 1-3 days',    destinationLabel: 'Bank details',      destinationPlaceholder: 'IBAN / routing + account' },
];

interface Props {
  availableUsd: number;
}

export default function WithdrawForm({ availableUsd }: Props) {
  const [method, setMethod] = useState<WithdrawMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const request = useRequestWithdrawal();

  const selected = METHODS.find((m) => m.key === method) ?? null;
  const numericAmount = Number(amount);
  const valid =
    !!selected &&
    numericAmount > 0 &&
    numericAmount <= availableUsd &&
    destination.trim().length > 0;

  const handleSubmit = async () => {
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
      toast.success(
        `Withdrawal requested — $${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} pending review.`,
      );
      setAmount('');
      setDestination('');
      setMethod(null);
    } catch (err) {
      toast.error((err as Error).message ?? 'Withdrawal failed');
    }
  };

  return (
    <div className="space-y-4">
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
                onClick={handleSubmit}
                disabled={!valid || request.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]"
              >
                {request.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request withdrawal'}
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

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Withdrawals are reviewed by our team and typically processed within 24 hours.
            The amount is debited from your balance immediately and refunded if the request is rejected.
          </p>
        </div>
      )}
    </div>
  );
}
