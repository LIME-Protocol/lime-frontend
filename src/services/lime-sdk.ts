import { LimeClient, SolanaCollateral, SolanaMarketService, SolanaSettlement } from '@lime/solana';
import type { AnchorWalletLike } from '@lime/solana';
import type { Connection } from '@solana/web3.js';

import { requireSolanaConfig } from '@/config/solana';

export function createLimeSdk(connection: Connection, wallet: AnchorWalletLike) {
  const config = requireSolanaConfig();
  const client = new LimeClient(connection, wallet, config);

  return {
    client,
    market: new SolanaMarketService(client),
    collateral: new SolanaCollateral(client),
    settlement: new SolanaSettlement(client),
  };
}
