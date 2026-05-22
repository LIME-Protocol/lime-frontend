import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Buffer } from 'buffer';

import { solanaConfig } from '@/config/solana';
import type { WalletProvider } from '@/services/wallet';

function chainId() {
  if (solanaConfig.network === 'mainnet-beta') return 'solana-mainnet';
  if (solanaConfig.network === 'localnet') return 'solana-localnet';
  return 'solana-devnet';
}

export function useSolanaWalletProvider(): WalletProvider {
  const wallet = useWallet();
  const walletModal = useWalletModal();

  return useMemo(() => ({
    async connect() {
      if (wallet.publicKey) return wallet.publicKey.toBase58();
      walletModal.setVisible(true);
      throw new Error('Connect your wallet to continue.');
    },
    async disconnect() {
      await wallet.disconnect();
    },
    getAddress() {
      return wallet.publicKey?.toBase58() ?? null;
    },
    isConnected() {
      return Boolean(wallet.connected && wallet.publicKey);
    },
    async signMessage(message: string) {
      if (!wallet.signMessage) {
        throw new Error('This wallet does not support message signing.');
      }
      if (!wallet.publicKey) {
        walletModal.setVisible(true);
        throw new Error('Connect your wallet to sign this order.');
      }
      const signature = await wallet.signMessage(new TextEncoder().encode(message));
      return Buffer.from(signature).toString('base64');
    },
    getChain() {
      return chainId();
    },
  }), [wallet, walletModal]);
}
