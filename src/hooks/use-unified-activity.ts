import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export type ActivityKind = 'deposit' | 'withdraw' | 'trade' | 'settlement';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  timestamp: string;
  amount: number;          // signed: + means money in, - means money out (or fees committed)
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'filled';
  method?: string;
  raw?: unknown;
}

/**
 * Combines transactions (deposit/withdraw) + trades (executions) into one
 * timeline. Done client-side to avoid extra DB views; small N per user.
 */
export function useUnifiedActivity(limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unified-activity', user?.id, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const [txRes, tradesRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, type, method, amount, currency, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase.rpc('get_my_trades', { p_market_id: null, p_limit: limit }),
      ]);

      if (txRes.error) throw txRes.error;
      if (tradesRes.error) throw tradesRes.error;

      const tx: ActivityItem[] = (txRes.data ?? []).map((t) => ({
        id: t.id,
        kind: t.type as ActivityKind,
        timestamp: t.created_at,
        amount: t.type === 'deposit' ? Number(t.amount) : -Number(t.amount),
        description:
          t.type === 'deposit'
            ? `Deposit · ${String(t.method).replace(/_/g, ' ')}`
            : `Withdraw · ${String(t.method)}`,
        status: t.status as ActivityItem['status'],
        method: t.method,
      }));

      const trades: ActivityItem[] = (tradesRes.data ?? []).map(
        (tr: {
          id: string;
          market_id: string;
          price: number;
          quantity: number;
          executed_at: string;
          side: 'buy' | 'sell';
        }) => {
          const price = Number(tr.price);
          const qty = Number(tr.quantity);
          const cost = qty * (tr.side === 'buy' ? price : 1 - price);
          return {
            id: `trade-${tr.id}`,
            kind: 'trade' as const,
            timestamp: tr.executed_at,
            amount: -cost, // money committed for that side
            description: `${tr.side === 'buy' ? 'Bought' : 'Sold'} ${qty} contracts @ ${(price * 100).toFixed(1)}¢`,
            status: 'filled' as const,
          };
        },
      );

      return [...tx, ...trades]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    enabled: !!user,
    staleTime: 10_000,
  });
}
