import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useDeposit } from '@/hooks/use-wallet';
import { useWalletSummary } from '@/hooks/use-wallet-summary';
import LoadingState from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Wallet,
  CreditCard,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Lock,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import WithdrawForm from '@/components/wallet/WithdrawForm';
import SimulationBanner from '@/components/wallet/SimulationBanner';
import ActivityFeed from '@/components/wallet/ActivityFeed';

type WalletTab = 'deposit' | 'withdraw' | 'activity';

type DepositMethod = 'wire' | 'card' | 'pix';

const methods: { key: DepositMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="h-5 w-5" />, description: 'Visa, Mastercard, Amex — instant' },
  { key: 'wire', label: 'Bank Wire', icon: <Building2 className="h-5 w-5" />, description: 'ACH or SWIFT — 1-3 business days' },
  { key: 'pix', label: 'PIX', icon: <span className="text-lg">BR</span>, description: 'Transferencia instantanea — Brasil' },
];

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: summary, isLoading: sumLoading } = useWalletSummary();
  const deposit = useDeposit();
  const [tab, setTab] = useState<WalletTab>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState('');

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/auth" replace />;

  const available = summary?.available ?? 0;
  const reserved = summary?.reserved ?? 0;
  const total = summary?.total ?? 0;
  const pnl = summary?.lifetime_pnl ?? 0;
  const pnlPositive = pnl >= 0;

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await deposit.mutateAsync({ method: selectedMethod, amount: Number(amount), currency: 'USD' });
      toast.success(`$${Number(amount).toLocaleString()} deposited successfully`);
      setAmount('');
      setSelectedMethod(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="animate-reveal-up">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold">Wallet</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Fund your account</p>
          </div>
        </div>
      </div>

      <SimulationBanner />

      {/* Balance breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-reveal-up stagger-1">
        <div className="surface-card p-5 glow-accent">
          <p className="data-label mb-2 flex items-center gap-1.5">
            <Wallet className="h-3 w-3" /> Available
          </p>
          <p className="text-[28px] font-bold font-mono tabular-nums leading-none">
            ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Free to trade or withdraw</p>
        </div>

        <div className="surface-card p-5">
          <p className="data-label mb-2 flex items-center gap-1.5">
            <Lock className="h-3 w-3" /> Reserved
          </p>
          <p className="text-[28px] font-bold font-mono tabular-nums leading-none text-muted-foreground">
            ${reserved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Locked in open orders</p>
        </div>

        <div className="surface-card p-5">
          <p className="data-label mb-2 flex items-center gap-1.5">
            {pnlPositive ? <TrendingUp className="h-3 w-3 text-positive" /> : <TrendingDown className="h-3 w-3 text-negative" />}
            Lifetime profit
          </p>
          <p
            className={cn(
              'text-[28px] font-bold font-mono tabular-nums leading-none',
              pnlPositive ? 'text-positive' : 'text-negative',
            )}
          >
            {pnlPositive ? '+' : '−'}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Realized PnL across all markets</p>
        </div>
      </div>

      {sumLoading && (
        <p className="text-[11px] text-muted-foreground text-center -mt-3">Updating balances…</p>
      )}

      <div className="text-[11px] text-muted-foreground -mt-2">
        Total equity:{' '}
        <span className="font-mono font-semibold text-foreground">
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border animate-reveal-up stagger-2">
        {([
          { key: 'deposit',  label: 'Deposit',  icon: <ArrowDownLeft className="h-3.5 w-3.5" /> },
          { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
          { key: 'activity', label: 'Activity', icon: <History className="h-3.5 w-3.5" /> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'withdraw' && (
        <div className="animate-fade-in">
          <WithdrawForm
            availableUsd={available}
            dailyLimit={summary?.daily_limit}
            dailyRemaining={summary?.daily_remaining}
          />
        </div>
      )}

      {tab === 'activity' && (
        <div className="animate-fade-in">
          <ActivityFeed />
        </div>
      )}

      {tab === 'deposit' && (
      <div className="space-y-4 animate-reveal-up stagger-2">
        <h2 className="text-sm font-semibold">Deposit Funds</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {methods.map((m) => (
            <button
              key={m.key}
              onClick={() => { setSelectedMethod(m.key); setAmount(''); }}
              className={cn(
                'surface-card p-4 text-left transition-all active:scale-[0.97] group',
                selectedMethod === m.key
                  ? 'border-primary/40 ring-2 ring-primary/20 bg-primary/5'
                  : 'hover:border-primary/20'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {m.icon}
                <span className="text-[13px] font-semibold">{m.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">{m.description}</p>
            </button>
          ))}
        </div>

        {selectedMethod && (
          <div className="surface-card p-5 animate-scale-in space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-positive" />
              Deposit via {methods.find(m => m.key === selectedMethod)?.label}
            </h3>

            <div className="space-y-2">
              <label className="data-label">Amount (USD)</label>
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
                    step="0.01"
                  />
                </div>
                <Button onClick={handleDeposit} disabled={deposit.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]">
                  {deposit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit'}
                </Button>
              </div>
              <div className="flex gap-2">
                {[50, 100, 500, 1000].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} className="px-3 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                    ${v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
