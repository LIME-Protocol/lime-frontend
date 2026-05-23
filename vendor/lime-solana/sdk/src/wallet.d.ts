import { PublicKey } from "@solana/web3.js";
import type { AnchorWalletLike, SolanaConfig, WalletChain, WalletProvider } from "./types.js";
export declare class SolanaWalletProvider implements WalletProvider {
    private readonly wallet;
    private readonly config;
    private connectedAddress;
    constructor(wallet: AnchorWalletLike, config: SolanaConfig);
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    getAddress(): string | null;
    isConnected(): boolean;
    signMessage(message: string): Promise<string>;
    getChain(): WalletChain;
    getPublicKey(): PublicKey;
}
