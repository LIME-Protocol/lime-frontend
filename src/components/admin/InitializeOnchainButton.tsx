import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { Blocks, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { QueryClient } from '@tanstack/react-query';
import type { AnchorWalletLike } from '@lime/solana';

import { Button } from '@/components/ui/button';
import { solanaConfig } from '@/config/solana';
import type { DbMarket } from '@/hooks/use-markets';
import { useLimeSdk } from '@/hooks/use-lime-sdk';
import { supabase } from '@/integrations/supabase/client';
import {
  buildOnchainMarketInput,
  deriveVaultTokenAccount,
  ensureVaultTokenAccount,
  generateOnchainMarketId,
} from '@/lib/onchain-admin';

interface InitializeOnchainButtonProps {
  market: DbMarket;
  queryClient: QueryClient;
}

export default function InitializeOnchainButton({ market, queryClient }: InitializeOnchainButtonProps) {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const sdk = useLimeSdk();
  const connected = Boolean(wallet.publicKey && wallet.signTransaction);

  const handleInitialize = async () => {
    if (!connected || !sdk || !wallet.publicKey || !wallet.signTransaction) {
      walletModal.setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const onchainMarketId = generateOnchainMarketId();
      const marketInput = buildOnchainMarketInput({
        marketId: onchainMarketId,
        lowerBound: Number(market.lower_bound),
        upperBound: Number(market.upper_bound),
        resolutionDate: market.resolution_date,
        settlementSource: market.settlement_source,
      });
      const usdcMint = new PublicKey(solanaConfig.usdcMint);
      const vaultProgramId = new PublicKey(solanaConfig.vaultProgramId);
      const { vaultAuthority, vaultTokenAccount } = deriveVaultTokenAccount({
        marketId: marketInput.marketId,
        usdcMint,
        vaultProgramId,
      });
      const anchorWallet: AnchorWalletLike = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
        signMessage: wallet.signMessage,
      };

      await sdk.market.createMarket(marketInput);
      await ensureVaultTokenAccount({
        connection,
        wallet: anchorWallet,
        usdcMint,
        vaultAuthority,
        vaultTokenAccount,
      });
      await sdk.collateral.initMarketVault(String(onchainMarketId), vaultTokenAccount.toBase58());
      await sdk.settlement.initMarketSettlement(String(onchainMarketId));

      const { error } = await supabase
        .from('markets')
        .update({ onchain_market_id: onchainMarketId })
        .eq('id', market.id);
      if (error) throw error;

      toast.success(`Market initialized on-chain as #${onchainMarketId}.`);
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['market', market.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initialize market on-chain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" className="text-xs active:scale-[0.97] h-8" onClick={handleInitialize} disabled={loading}>
      {connected ? <Blocks className="h-3.5 w-3.5 mr-1 text-primary" /> : <Wallet className="h-3.5 w-3.5 mr-1" />}
      {connected ? 'Initialize on-chain' : 'Connect wallet'}
    </Button>
  );
}
