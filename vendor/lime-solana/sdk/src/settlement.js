import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { claimPda, marketPda, positionPda, protocolPda, refundPda, resolutionPda, vaultPda, vaultAuthorityPda, vaultTokenAuthorityPda, } from "./pda.js";
export class SolanaSettlement {
    client;
    constructor(client) {
        this.client = client;
    }
    async initializeProtocol(resolver) {
        const [protocolConfig] = protocolPda(this.client.addresses.settlementProgramId);
        return this.client.settlementProgram.methods
            .initializeProtocol(new PublicKey(resolver))
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
        })
            .rpc();
    }
    async initMarketSettlement(marketId) {
        const marketIdBigInt = BigInt(marketId);
        const [protocolConfig] = protocolPda(this.client.addresses.settlementProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [vaultAuthority] = vaultAuthorityPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        return this.client.settlementProgram.methods
            .initMarketSettlement(new BN(marketId))
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
            marketVault,
            vaultAuthority,
        })
            .rpc();
    }
    async resolveMarket(marketId, observedValue) {
        const marketIdBigInt = BigInt(marketId);
        const [protocolConfig] = protocolPda(this.client.addresses.settlementProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [resolution] = resolutionPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        const [vaultAuthority] = vaultAuthorityPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        return this.client.settlementProgram.methods
            .submitResolution(new BN(marketId), new BN(Math.floor(observedValue)))
            .accounts({
            resolver: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
            vaultAuthority,
            resolution,
        })
            .rpc();
    }
    async claimPayout(marketId, side = "long") {
        const marketIdBigInt = BigInt(marketId);
        const [resolution] = resolutionPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [claimReceipt] = claimPda(this.client.addresses.settlementProgramId, marketIdBigInt, this.client.provider.wallet.publicKey, side);
        const [vaultAuthority] = vaultAuthorityPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        const [vaultTokenAuthority] = vaultTokenAuthorityPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [userPosition] = positionPda(this.client.addresses.vaultProgramId, marketIdBigInt, this.client.provider.wallet.publicKey, side);
        const authorityAccount = await this.client.settlementProgram.account.vaultAuthority.fetch(vaultAuthority);
        const userAta = getAssociatedTokenAddressSync(authorityAccount.tokenMint, this.client.provider.wallet.publicKey);
        return this.client.settlementProgram.methods
            .claimPayout(new BN(marketId))
            .accounts({
            user: this.client.provider.wallet.publicKey,
            usdcMint: authorityAccount.tokenMint,
            userAta,
            resolution,
            userPosition,
            claimReceipt,
            marketVault,
            vaultAuthority,
            vaultTokenAuthority,
            vaultTokenAccount: authorityAccount.vaultTokenAccount,
            vaultProgram: this.client.addresses.vaultProgramId,
        })
            .rpc();
    }
    async refundIfInvalidated(marketId, side = "long") {
        const marketIdBigInt = BigInt(marketId);
        const [protocolConfig] = protocolPda(this.client.addresses.settlementProgramId);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [vaultAuthority] = vaultAuthorityPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        const [vaultTokenAuthority] = vaultTokenAuthorityPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [userPosition] = positionPda(this.client.addresses.vaultProgramId, marketIdBigInt, this.client.provider.wallet.publicKey, side);
        const [refundReceipt] = refundPda(this.client.addresses.settlementProgramId, marketIdBigInt, this.client.provider.wallet.publicKey, side);
        const authorityAccount = await this.client.settlementProgram.account.vaultAuthority.fetch(vaultAuthority);
        const userAta = getAssociatedTokenAddressSync(authorityAccount.tokenMint, this.client.provider.wallet.publicKey);
        return this.client.settlementProgram.methods
            .refund(new BN(marketId))
            .accounts({
            admin: this.client.provider.wallet.publicKey,
            protocolConfig,
            market,
            usdcMint: authorityAccount.tokenMint,
            userAta,
            userPosition,
            refundReceipt,
            marketVault,
            vaultAuthority,
            vaultTokenAuthority,
            vaultTokenAccount: authorityAccount.vaultTokenAccount,
            vaultProgram: this.client.addresses.vaultProgramId,
        })
            .rpc();
    }
    async getPayoutStatus(marketId, side = "long") {
        const marketIdBigInt = BigInt(marketId);
        const [resolution] = resolutionPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        const [claimReceipt] = claimPda(this.client.addresses.settlementProgramId, marketIdBigInt, this.client.provider.wallet.publicKey, side);
        const resolutionAccount = await this.client.settlementProgram.account.resolution.fetchNullable(resolution);
        if (!resolutionAccount)
            return "pending";
        const claimAccount = await this.client.settlementProgram.account.claimReceipt.fetchNullable(claimReceipt);
        if (!claimAccount)
            return "claimable";
        return claimAccount.claimed ? "claimed" : "claimable";
    }
}
