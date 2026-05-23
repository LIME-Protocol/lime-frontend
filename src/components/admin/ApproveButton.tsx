import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';
import { useLimeSdk } from '@/hooks/use-lime-sdk';

interface ApproveButtonProps {
  marketId: string;
  onchainMarketId?: string | number | null;
  queryClient: QueryClient;
}

export default function ApproveButton({ marketId, onchainMarketId, queryClient }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const sdk = useLimeSdk();

  const handleApprove = async () => {
    if (!onchainMarketId) {
      toast.error('Initialize this market on-chain before approving it.');
      return;
    }
    if (!sdk) {
      toast.error('Connect the admin wallet before approving this market.');
      return;
    }

    setLoading(true);
    try {
      await sdk.market.activateMarket(BigInt(onchainMarketId));
      const { error } = await supabase.from('markets').update({ status: 'active' }).eq('id', marketId);
      if (error) throw error;
      toast.success('Market approved and activated');
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve market');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8" onClick={handleApprove} disabled={loading || !onchainMarketId}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-positive" /> Approve</>}
    </Button>
  );
}
