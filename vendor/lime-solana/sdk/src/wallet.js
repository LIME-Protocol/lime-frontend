export class SolanaWalletProvider {
    wallet;
    config;
    connectedAddress = null;
    constructor(wallet, config) {
        this.wallet = wallet;
        this.config = config;
    }
    async connect() {
        this.connectedAddress = this.wallet.publicKey.toBase58();
        return this.connectedAddress;
    }
    async disconnect() {
        this.connectedAddress = null;
    }
    getAddress() {
        return this.connectedAddress;
    }
    isConnected() {
        return this.connectedAddress !== null;
    }
    async signMessage(message) {
        if (!this.wallet.signMessage) {
            throw new Error("Wallet does not support signMessage");
        }
        const signed = await this.wallet.signMessage(Buffer.from(message));
        return Buffer.from(signed).toString("base64");
    }
    getChain() {
        if (this.config.network === "mainnet-beta")
            return "solana-mainnet";
        if (this.config.network === "devnet")
            return "solana-devnet";
        return "solana-localnet";
    }
    getPublicKey() {
        return this.wallet.publicKey;
    }
}
