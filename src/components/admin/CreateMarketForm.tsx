import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';

interface CreateMarketFormProps {
  onClose: () => void;
  userId: string;
  queryClient: QueryClient;
}

export default function CreateMarketForm({ onClose, userId, queryClient }: CreateMarketFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'Rates', metric_name: '', unit: '%',
    lower_bound: '', upper_bound: '', resolution_date: '',
    settlement_source: '', description: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title || !form.metric_name || !form.lower_bound || !form.upper_bound || !form.resolution_date || !form.settlement_source) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('markets').insert({
        title: form.title,
        category: form.category,
        metric_name: form.metric_name,
        unit: form.unit,
        lower_bound: parseFloat(form.lower_bound),
        upper_bound: parseFloat(form.upper_bound),
        resolution_date: new Date(form.resolution_date).toISOString(),
        settlement_source: form.settlement_source,
        description: form.description || null,
        created_by: userId,
        status: 'draft',
      });
      if (error) throw error;
      toast.success('Market created successfully');
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create market');
    } finally {
      setSubmitting(false);
    }
  };

  const CATEGORIES = ['Rates', 'Inflation', 'FX', 'Macro', 'Equities', 'Commodities', 'Labor', 'Crypto', 'Weather', 'Climate', 'Politics', 'Events', 'Entertainment', 'Sports', 'Tech'];

  return (
    <div className="surface-card p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Create Market</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Title *</Label>
          <Input placeholder="Fed Funds Rate — Dec 2025" value={form.title} onChange={e => update('title', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Variable Name *</Label>
          <Input placeholder="Fed Funds Upper" value={form.metric_name} onChange={e => update('metric_name', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Unit</Label>
          <Input placeholder="%" value={form.unit} onChange={e => update('unit', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Lower Bound *</Label>
          <Input type="number" placeholder="3.0" value={form.lower_bound} onChange={e => update('lower_bound', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Upper Bound *</Label>
          <Input type="number" placeholder="5.5" value={form.upper_bound} onChange={e => update('upper_bound', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resolution Date *</Label>
          <Input type="date" value={form.resolution_date} onChange={e => update('resolution_date', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Settlement Source *</Label>
          <Input placeholder="Federal Reserve — FOMC" value={form.settlement_source} onChange={e => update('settlement_source', e.target.value)} className="bg-secondary/50 border-border" />
        </div>
      </div>
      <div className="mb-4 space-y-1.5">
        <Label className="text-xs">Description</Label>
        <textarea placeholder="Describe the variable being tracked..." value={form.description} onChange={e => update('description', e.target.value)} className="w-full h-20 px-3 py-2 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none text-foreground" />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCreate} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]" size="sm">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Market'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
