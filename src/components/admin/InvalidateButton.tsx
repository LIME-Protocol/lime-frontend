import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';

interface InvalidateButtonProps {
  marketId: string;
  queryClient: QueryClient;
}

export default function InvalidateButton({ marketId, queryClient }: InvalidateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleInvalidate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('markets').update({ status: 'invalidated' }).eq('id', marketId);
      if (error) throw error;
      toast.success('Market invalidated');
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8 text-negative hover:text-negative" onClick={handleInvalidate} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><XCircle className="h-3.5 w-3.5 mr-1" /> Invalidate</>}
    </Button>
  );
}
