import { BN } from "@coral-xyz/anchor";
import { marketPda, protocolPda } from "./pda.js";
export class SolanaMarketService {
    client;
    constructor(client) {
        this.client = client;
    }
    async initializeProtocol(feeBps = 50) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        return this.client.marketProgram.methods
            .initializeProtocol(feeBps)
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
        })
            .rpc();
    }
    async createMarket(input) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, input.marketId);
        return this.client.marketProgram.methods
            .createMarket(new BN(input.marketId.toString()), new BN(input.lowerBound.toString()), new BN(input.upperBound.toString()), new BN(input.resolutionTs.toString()), input.settlementSource, { linear: {} }, input.minParticipants)
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
        })
            .rpc();
    }
    async activateMarket(marketId) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketId);
        return this.client.marketProgram.methods
            .activateMarket()
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
        })
            .rpc();
    }
    async closeMarket(marketId) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketId);
        return this.client.marketProgram.methods
            .closeMarket()
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
        })
            .rpc();
    }
    async markResolved(marketId) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketId);
        return this.client.marketProgram.methods
            .markResolved()
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
        })
            .rpc();
    }
    async markSettled(marketId) {
        const [protocolConfig] = protocolPda(this.client.addresses.marketProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketId);
        return this.client.marketProgram.methods
            .markSettled()
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
        })
            .rpc();
    }
}
