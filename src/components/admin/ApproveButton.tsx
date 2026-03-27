import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';

interface ApproveButtonProps {
  marketId: string;
  queryClient: QueryClient;
}

export default function ApproveButton({ marketId, queryClient }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('markets').update({ status: 'active' }).eq('id', marketId);
      if (error) throw error;
      toast.success('Market approved and activated');
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8" onClick={handleApprove} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-positive" /> Approve</>}
    </Button>
  );
}
