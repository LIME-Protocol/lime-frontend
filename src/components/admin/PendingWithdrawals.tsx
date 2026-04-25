import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PendingTx {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  metadata: { destination?: string } | null;
  created_at: string;
}

export default function PendingWithdrawals() {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['pending-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, user_id, amount, currency, method, metadata, created_at')
        .eq('type', 'withdraw')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PendingTx[];
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('approve_withdrawal', { p_tx_id: id, p_external_ref: null });
      if (error) throw error;
      const r = data as { error?: string };
      if (r?.error) throw new Error(r.error);
    },
    onSuccess: () => {
      toast.success('Withdrawal approved');
      queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('reject_withdrawal', { p_tx_id: id, p_reason: 'Rejected by admin' });
      if (error) throw error;
      const r = data as { error?: string };
      if (r?.error) throw new Error(r.error);
    },
    onSuccess: () => {
      toast.success('Withdrawal rejected and refunded');
      queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (data.length === 0) {
    return <div className="surface-card p-8 text-center"><p className="text-sm text-muted-foreground">No pending withdrawals</p></div>;
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 data-label">User</th>
              <th className="text-left px-4 py-3 data-label">Method</th>
              <th className="text-left px-4 py-3 data-label hidden md:table-cell">Destination</th>
              <th className="text-right px-4 py-3 data-label">Amount</th>
              <th className="text-right px-4 py-3 data-label">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => (
              <tr key={tx.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[120px]">{tx.user_id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-xs font-semibold">{tx.method}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono truncate max-w-[180px] hidden md:table-cell">{tx.metadata?.destination ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-xs font-semibold">
                  ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.currency}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => approve.mutate(tx.id)} disabled={approve.isPending}>
                      <Check className="h-3 w-3 mr-1 text-positive" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => reject.mutate(tx.id)} disabled={reject.isPending}>
                      <X className="h-3 w-3 mr-1 text-negative" /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
