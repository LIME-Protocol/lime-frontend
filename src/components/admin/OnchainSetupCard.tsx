import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, PlugZap, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useLimeSdk } from '@/hooks/use-lime-sdk';

function isAlreadyInitialized(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /already|in use|account.*exist/i.test(message);
}

export default function OnchainSetupCard() {
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const sdk = useLimeSdk();
  const connected = Boolean(wallet.publicKey);

  const handleInitialize = async () => {
    if (!sdk || !wallet.publicKey) {
      walletModal.setVisible(true);
      return;
    }

    setLoading(true);
    try {
      try {
        await sdk.market.initializeProtocol();
      } catch (error) {
        if (!isAlreadyInitialized(error)) throw error;
      }

      try {
        await sdk.settlement.initializeProtocol(wallet.publicKey.toBase58());
      } catch (error) {
        if (!isAlreadyInitialized(error)) throw error;
      }

      toast.success('On-chain protocols are ready.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initialize on-chain protocols');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PlugZap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">On-chain setup</h2>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Initialize protocol config accounts before creating Program markets.
          </p>
        </div>
        {connected && (
          <span className="max-w-[180px] truncate rounded-md bg-secondary/70 px-2 py-1 text-[10px] font-mono text-muted-foreground">
            {wallet.publicKey?.toBase58()}
          </span>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={handleInitialize} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connected ? <PlugZap className="h-3.5 w-3.5" /> : <Wallet className="h-3.5 w-3.5" />}
        {connected ? 'Initialize protocols' : 'Connect admin wallet'}
      </Button>
    </div>
  );
}
