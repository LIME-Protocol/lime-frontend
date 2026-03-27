import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';

interface ResolveFormProps {
  marketId: string;
  unit: string;
  onClose: () => void;
  userId: string;
  queryClient: QueryClient;
}

export default function ResolveForm({ marketId, unit, onClose, userId, queryClient }: ResolveFormProps) {
  const [observedValue, setObservedValue] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResolve = async () => {
    if (!observedValue || !source) { toast.error('Please fill required fields'); return; }
    setSubmitting(true);
    try {
      const { error: resErr } = await supabase.from('resolutions').insert({
        market_id: marketId,
        observed_value: parseFloat(observedValue),
        settlement_source_used: source,
        resolution_notes: notes || null,
        resolved_by: userId,
      });
      if (resErr) throw resErr;

      const { error: mktErr } = await supabase.from('markets').update({
        status: 'resolved',
        final_observed_value: parseFloat(observedValue),
      }).eq('id', marketId);
      if (mktErr) throw mktErr;

      await supabase.from('audit_logs').insert({
        actor_id: userId, actor_type: 'admin', action: 'resolve',
        entity_type: 'market', entity_id: marketId,
        metadata: { observed_value: parseFloat(observedValue), source },
      });

      toast.success('Market resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve market');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/20 animate-scale-in">
      <h4 className="text-sm font-semibold mb-3">Resolve Market</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Observed Value ({unit}) *</Label>
          <Input type="number" placeholder="Enter the final value" value={observedValue} onChange={e => setObservedValue(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Settlement Source *</Label>
          <Input placeholder="Link or reference" value={source} onChange={e => setSource(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
      </div>
      <div className="mb-3 space-y-1.5">
        <Label className="text-xs">Notes (optional)</Label>
        <Input placeholder="Additional resolution notes" value={notes} onChange={e => setNotes(e.target.value)} className="bg-secondary/50 border-border" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleResolve} disabled={submitting} className="bg-positive hover:bg-positive/90 text-primary-foreground active:scale-[0.97]">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Resolution'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
