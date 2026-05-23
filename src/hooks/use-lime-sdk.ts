import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { AnchorWalletLike } from '@lime/solana';

import { createLimeSdk } from '@/services/lime-sdk';

export function useLimeSdk() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const anchorWallet: AnchorWalletLike = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
      signMessage: wallet.signMessage,
    };

    return createLimeSdk(connection, anchorWallet);
  }, [
    connection,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
    wallet.signMessage,
  ]);
}
