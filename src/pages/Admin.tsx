import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useMarkets, type DbMarket } from '@/hooks/use-markets';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import CreateMarketForm from '@/components/admin/CreateMarketForm';
import ApproveButton from '@/components/admin/ApproveButton';
import InvalidateButton from '@/components/admin/InvalidateButton';
import ResolveForm from '@/components/admin/ResolveForm';
import { cn } from '@/lib/utils';
import { Plus, CheckCircle2, Shield, ClipboardList, Loader2, Search, ArrowUpRight } from 'lucide-react';
import RoleGate from '@/components/auth/RoleGate';
import PendingWithdrawals from '@/components/admin/PendingWithdrawals';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import OnchainSetupCard from '@/components/admin/OnchainSetupCard';
import InitializeOnchainButton from '@/components/admin/InitializeOnchainButton';
import type { Tables } from '@/integrations/supabase/types';

type AdminTab = 'markets' | 'withdrawals' | 'logs';
type AuditLog = Tables<'audit_logs'>;
type AdminMarket = DbMarket & { source: 'db' };
type CombinedLog = {
  id: string;
  action: AuditLog['action'];
  detail: string;
  timestamp: string;
  operator: string;
  marketTitle: string;
};

export default function Admin() {
  return (
    <RoleGate role="admin" unauthorizedRedirectTo="/app">
      <AdminContent />
    </RoleGate>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>('markets');
  const [showForm, setShowForm] = useState(false);
  const [resolveModal, setResolveModal] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const { data: dbMarkets = [] } = useMarkets();

  const { data: dbLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;

  const allMarkets: AdminMarket[] = dbMarkets
    .map(m => ({ ...m, source: 'db' as const }))
    .filter(m => !searchQ || m.title.toLowerCase().includes(searchQ.toLowerCase()));

  const combinedLogs: CombinedLog[] = dbLogs.map((l) => ({
      id: l.id, action: l.action, detail: l.metadata ? JSON.stringify(l.metadata) : '', timestamp: l.created_at,
      operator: l.actor_id || 'system', marketTitle: l.entity_type + ' ' + (l.entity_id || '').slice(0, 8),
    }));

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'markets',     label: 'Markets',      icon: <Shield className="h-3.5 w-3.5" /> },
    { key: 'withdrawals', label: 'Withdrawals',  icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
    { key: 'logs',        label: 'Audit Trail',  icon: <ClipboardList className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold">Admin Panel</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Market Management</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] shadow-lg shadow-primary/15" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Market
        </Button>
      </div>

      <OnchainSetupCard />

      {showForm && <CreateMarketForm onClose={() => setShowForm(false)} userId={user.id} queryClient={queryClient} />}

      <div className="flex gap-1 border-b border-border animate-reveal-up stagger-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px',
            tab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'markets' && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search markets..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full h-9 pl-9 pr-3 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>

          <div className="animate-fade-in space-y-3">
            {allMarkets.map((m, i) => (
              <div key={m.id} className="surface-card p-5 animate-reveal-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <StatusBadge type="market" status={m.status} />
                      <span className="data-label">{m.category}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {Number(m.lower_bound).toLocaleString()} – {Number(m.upper_bound).toLocaleString()} {m.unit}
                      </span>
                      {m.source === 'db' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">LIVE</span>}
                    </div>
                    <h3 className="text-[13px] font-semibold mb-0.5">{m.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Resolves: {new Date(m.resolution_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {m.final_observed_value != null && (
                        <span className="ml-2">· Settled at <span className="data-value text-foreground">{Number(m.final_observed_value).toLocaleString()} {m.unit}</span></span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(m.status === 'pending' || m.status === 'draft') && m.source === 'db' && (
                      <>
                        {!m.onchain_market_id && <InitializeOnchainButton market={m} queryClient={queryClient} />}
                        <ApproveButton marketId={m.id} onchainMarketId={m.onchain_market_id} queryClient={queryClient} />
                      </>
                    )}
                    {m.status === 'active' && m.source === 'db' && (
                      <>
                        <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8" onClick={() => setResolveModal(m.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-positive" /> Resolve
                        </Button>
                        <InvalidateButton marketId={m.id} queryClient={queryClient} />
                      </>
                    )}
                  </div>
                </div>
                {resolveModal === m.id && (
                  <ResolveForm marketId={m.id} unit={m.unit} onClose={() => setResolveModal(null)} userId={user.id} queryClient={queryClient} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'withdrawals' && (
        <div className="animate-fade-in">
          <PendingWithdrawals />
        </div>
      )}

      {tab === 'logs' && (
        <div className="surface-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 data-label">Action</th>
                  <th className="text-left px-4 py-3 data-label">Entity</th>
                  <th className="text-left px-4 py-3 data-label hidden md:table-cell">Actor</th>
                  <th className="text-left px-4 py-3 data-label">Detail</th>
                  <th className="text-right px-4 py-3 data-label">Date</th>
                </tr>
              </thead>
              <tbody>
                {combinedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3"><StatusBadge type="log" status={log.action} /></td>
                    <td className="px-4 py-3 text-[13px] font-medium truncate max-w-[200px]">{log.marketTitle}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell truncate max-w-[120px]">{log.operator}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.detail}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono tabular-nums">
                      {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
