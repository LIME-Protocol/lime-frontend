import { ArrowDownLeft, ArrowUpRight, Repeat, CheckCircle2, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUnifiedActivity, type ActivityItem } from '@/hooks/use-unified-activity';
import { useCancelWithdrawal } from '@/hooks/use-cancel-withdrawal';

const KIND_ICON: Record<ActivityItem['kind'], JSX.Element> = {
  deposit: <ArrowDownLeft className="h-3.5 w-3.5" />,
  withdraw: <ArrowUpRight className="h-3.5 w-3.5" />,
  trade: <Repeat className="h-3.5 w-3.5" />,
  settlement: <CheckCircle2 className="h-3.5 w-3.5" />,
};

function exportCsv(items: ActivityItem[]) {
  const rows = [
    ['Date', 'Type', 'Description', 'Amount (USD)', 'Status'],
    ...items.map((i) => [
      new Date(i.timestamp).toISOString(),
      i.kind,
      i.description.replace(/,/g, ' '),
      i.amount.toFixed(2),
      i.status,
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lime-activity-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ActivityFeed() {
  const { data: items = [], isLoading } = useUnifiedActivity(100);
  const cancelWithdraw = useCancelWithdrawal();

  if (isLoading) {
    return (
      <div className="surface-card p-8 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="surface-card p-10 text-center space-y-2">
        <Repeat className="h-6 w-6 text-muted-foreground mx-auto opacity-60" />
        <p className="text-sm font-semibold">No activity yet</p>
        <p className="text-xs text-muted-foreground">
          Deposits, withdrawals and trades will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportCsv(items)} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 data-label">Type</th>
                <th className="text-left px-4 py-3 data-label">Description</th>
                <th className="text-right px-4 py-3 data-label">Amount</th>
                <th className="text-center px-4 py-3 data-label">Status</th>
                <th className="text-right px-4 py-3 data-label hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 data-label" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const positive = it.amount > 0;
                const isPendingWithdraw = it.kind === 'withdraw' && it.status === 'pending';
                return (
                  <tr key={it.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-semibold capitalize',
                          it.kind === 'deposit' && 'text-positive',
                          it.kind === 'withdraw' && 'text-negative',
                          it.kind === 'trade' && 'text-foreground',
                          it.kind === 'settlement' && 'text-primary',
                        )}
                      >
                        {KIND_ICON[it.kind]}
                        {it.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{it.description}</td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right font-mono tabular-nums text-xs font-semibold',
                        positive ? 'text-positive' : 'text-foreground',
                      )}
                    >
                      {positive ? '+' : ''}
                      ${Math.abs(it.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold',
                          it.status === 'confirmed' && 'bg-positive/10 text-positive',
                          it.status === 'filled' && 'bg-primary/10 text-primary',
                          it.status === 'pending' && 'bg-warning/10 text-warning',
                          it.status === 'cancelled' && 'bg-negative/10 text-negative',
                        )}
                      >
                        {it.status === 'pending' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                        )}
                        {it.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(it.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPendingWithdraw && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancelWithdraw.isPending}
                          onClick={() => cancelWithdraw.mutate(it.id)}
                          className="text-[11px] h-7 text-muted-foreground hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
