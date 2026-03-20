import { useState } from 'react';
import { markets, adminLogs } from '@/lib/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus, CheckCircle2, XCircle, Edit3, Shield, ClipboardList,
  ChevronDown, ChevronUp, X,
} from 'lucide-react';

type AdminTab = 'markets' | 'logs';

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('markets');
  const [showForm, setShowForm] = useState(false);
  const [resolveModal, setResolveModal] = useState<string | null>(null);

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'markets', label: 'Markets', icon: <Shield className="h-3.5 w-3.5" /> },
    { key: 'logs', label: 'Operational Logs', icon: <ClipboardList className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Create, manage, and resolve markets</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Market
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="surface-raised rounded-xl border p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Create Market</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField label="Title" placeholder="Fed Funds Rate — Dec 2025" />
            <FormField label="Category" placeholder="Rates" />
            <FormField label="Variable" placeholder="Fed Funds Upper" />
            <FormField label="Unit" placeholder="%" />
            <FormField label="Lower Bound (L)" placeholder="3.0" type="number" />
            <FormField label="Upper Bound (U)" placeholder="5.5" type="number" />
            <FormField label="Resolution Date" placeholder="" type="date" />
            <FormField label="Settlement Source" placeholder="Federal Reserve — FOMC Statement" />
          </div>
          <div className="mb-4">
            <label className="block text-[11px] text-muted-foreground mb-1">Description</label>
            <textarea
              placeholder="What variable does this market track? Be specific about the exact metric and timing."
              className="w-full h-20 px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97]" size="sm">
              Create Market
            </Button>
            <Button variant="outline" size="sm" className="active:scale-[0.97]">
              Save as Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b animate-reveal-up stagger-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
              tab === t.key
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Markets tab */}
      {tab === 'markets' && (
        <div className="space-y-3 animate-fade-in">
          {markets.map((m, i) => (
            <div
              key={m.id}
              className="surface-raised rounded-xl border p-5 animate-reveal-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <StatusBadge type="market" status={m.status} />
                    <span className="text-[11px] text-muted-foreground">{m.category}</span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                      {m.lowerBound.toLocaleString()} – {m.upperBound.toLocaleString()} {m.unit}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Resolves: {new Date(m.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {m.resolvedValue !== undefined && (
                      <span className="ml-2">· Settled at <span className="font-mono tabular-nums font-medium text-foreground">{m.resolvedValue.toLocaleString()} {m.unit}</span></span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {m.status === 'pending' && (
                    <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-positive" />
                      Approve
                    </Button>
                  )}
                  {m.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs active:scale-[0.97] h-8"
                        onClick={() => setResolveModal(m.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-positive" />
                        Resolve
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8">
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8 text-negative hover:text-negative">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Invalidate
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Resolve modal inline */}
              {resolveModal === m.id && (
                <div className="mt-4 p-4 border rounded-lg bg-secondary/30 animate-scale-in">
                  <h4 className="text-sm font-semibold mb-3">Resolve Market</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <FormField label={`Observed Value (${m.unit})`} placeholder="Enter the final value" type="number" />
                    <FormField label="Settlement Source Reference" placeholder="Link or reference" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-positive hover:bg-positive/90 text-positive-foreground active:scale-[0.97]">
                      Confirm Resolution
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setResolveModal(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logs tab */}
      {tab === 'logs' && (
        <div className="surface-raised rounded-xl border overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Market</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Operator</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Detail</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {adminLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <StatusBadge type="log" status={log.action} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{log.marketTitle}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{log.operator}</td>
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

function FormField({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
