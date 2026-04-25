import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBalances, useTransactions, useDeposit } from '@/hooks/use-wallet';
import LoadingState from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Wallet, CreditCard, Building2, Bitcoin, ArrowDownLeft, ArrowUpRight, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import WithdrawForm from '@/components/wallet/WithdrawForm';
import SimulationBanner from '@/components/wallet/SimulationBanner';

type WalletTab = 'deposit' | 'withdraw';

type DepositMethod = 'crypto_btc' | 'crypto_eth' | 'crypto_usdc' | 'wire' | 'card' | 'pix';

const methods: { key: DepositMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="h-5 w-5" />, description: 'Visa, Mastercard, Amex — instant' },
  { key: 'wire', label: 'Bank Wire', icon: <Building2 className="h-5 w-5" />, description: 'ACH or SWIFT — 1-3 business days' },
  { key: 'pix', label: 'PIX', icon: <span className="text-lg">🇧🇷</span>, description: 'Transferência instantânea — Brasil' },
  { key: 'crypto_usdc', label: 'USDC', icon: <span className="text-lg font-bold text-blue-500">$</span>, description: 'ERC-20 or Solana — near instant' },
  { key: 'crypto_btc', label: 'Bitcoin', icon: <Bitcoin className="h-5 w-5 text-orange-500" />, description: 'BTC on-chain — ~30 min' },
  { key: 'crypto_eth', label: 'Ethereum', icon: <span className="text-lg">⟠</span>, description: 'ETH on-chain — ~5 min' },
];

const mockAddresses: Record<string, string> = {
  crypto_btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  crypto_eth: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  crypto_usdc: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: balances = [], isLoading: balLoading } = useBalances();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const deposit = useDeposit();
  const [tab, setTab] = useState<WalletTab>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/auth" replace />;

  const usdBalance = balances.find((b: any) => b.currency === 'USD');
  const totalUsd = usdBalance ? Number(usdBalance.amount) : 0;

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
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const isCrypto = selectedMethod?.startsWith('crypto_');
  const cryptoAddr = selectedMethod ? mockAddresses[selectedMethod] : null;

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

      {/* Balance card */}
      <div className="surface-card p-6 animate-reveal-up stagger-1 glow-accent">
        <p className="data-label mb-2">Available Balance</p>
        <p className="text-[40px] font-bold font-mono tabular-nums leading-none">
          ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">USD</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border animate-reveal-up stagger-2">
        {([
          { key: 'deposit',  label: 'Deposit',  icon: <ArrowDownLeft className="h-3.5 w-3.5" /> },
          { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
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
          <WithdrawForm availableUsd={totalUsd} />
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

            {isCrypto && cryptoAddr && (
              <div className="bg-secondary/60 rounded-lg p-4 space-y-2">
                <p className="text-[11px] text-muted-foreground">Send funds to this address:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background/60 px-3 py-2 rounded-lg flex-1 truncate text-foreground">{cryptoAddr}</code>
                  <Button variant="outline" size="sm" onClick={() => copyAddress(cryptoAddr)} className="shrink-0">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-warning">⚠️ Only send {selectedMethod.replace('crypto_', '').toUpperCase()} to this address</p>
              </div>
            )}

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

      {/* Transaction history */}
      <div className="space-y-3 animate-reveal-up stagger-3">
        <h2 className="text-sm font-semibold">Transaction History</h2>
        {txLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : transactions.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 data-label">Type</th>
                    <th className="text-left px-4 py-3 data-label">Method</th>
                    <th className="text-right px-4 py-3 data-label">Amount</th>
                    <th className="text-center px-4 py-3 data-label">Status</th>
                    <th className="text-right px-4 py-3 data-label hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn('flex items-center gap-1.5 text-xs font-semibold', tx.type === 'deposit' ? 'text-positive' : 'text-negative')}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{tx.method.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-xs font-semibold">
                        ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold',
                          tx.status === 'confirmed' ? 'bg-positive/10 text-positive' :
                          tx.status === 'pending' ? 'bg-warning/10 text-warning' :
                          'bg-negative/10 text-negative'
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
