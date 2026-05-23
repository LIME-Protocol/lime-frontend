import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { collateralPda, marketPda, positionPda, vaultAuthorityPda, vaultPda, vaultTokenAuthorityPda, } from "./pda.js";
const SCALE = 1_000_000;
export class SolanaCollateral {
    client;
    constructor(client) {
        this.client = client;
    }
    async initMarketVault(marketId, vaultTokenAccount) {
        const marketIdBigInt = BigInt(marketId);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [vaultAuthority] = vaultTokenAuthorityPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [settlementAuthority] = vaultAuthorityPda(this.client.addresses.settlementProgramId, marketIdBigInt);
        return this.client.vaultProgram.methods
            .initMarketVault(new BN(marketId), settlementAuthority)
            .accounts({
            payer: this.client.provider.wallet.publicKey,
            usdcMint: this.client.addresses.usdcMint,
            market,
            vaultAuthority,
            marketVault,
            vaultTokenAccount: new PublicKey(vaultTokenAccount),
        })
            .rpc();
    }
    async lockCollateral(marketId, amount, _side = "long") {
        return this.depositCollateral(marketId, amount);
    }
    async depositCollateral(marketId, amount) {
        const marketIdBigInt = BigInt(marketId);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [userCollateral] = collateralPda(this.client.addresses.vaultProgramId, marketIdBigInt, this.client.provider.wallet.publicKey);
        const userAta = getAssociatedTokenAddressSync(this.client.addresses.usdcMint, this.client.provider.wallet.publicKey);
        const amountUnits = BigInt(Math.round(amount * SCALE));
        const vaultAccount = await this.client.vaultProgram.account.marketVault.fetch(marketVault);
        return this.client.vaultProgram.methods
            .depositCollateral(new BN(marketId), new BN(amountUnits.toString()))
            .accounts({
            user: this.client.provider.wallet.publicKey,
            usdcMint: this.client.addresses.usdcMint,
            market,
            userAta,
            marketVault,
            vaultTokenAccount: vaultAccount.vaultTokenAccount,
            userCollateral,
        })
            .rpc();
    }
    async releaseCollateral(marketId, amount) {
        return this.withdrawAvailableCollateral(marketId, amount);
    }
    async withdrawAvailableCollateral(marketId, amount) {
        const marketIdBigInt = BigInt(marketId);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [vaultAuthority] = vaultTokenAuthorityPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [userCollateral] = collateralPda(this.client.addresses.vaultProgramId, marketIdBigInt, this.client.provider.wallet.publicKey);
        const userAta = getAssociatedTokenAddressSync(this.client.addresses.usdcMint, this.client.provider.wallet.publicKey);
        const amountUnits = BigInt(Math.round(amount * SCALE));
        const vaultAccount = await this.client.vaultProgram.account.marketVault.fetch(marketVault);
        return this.client.vaultProgram.methods
            .withdrawAvailableCollateral(new BN(marketId), new BN(amountUnits.toString()))
            .accounts({
            user: this.client.provider.wallet.publicKey,
            usdcMint: this.client.addresses.usdcMint,
            market,
            marketVault,
            vaultAuthority,
            vaultTokenAccount: vaultAccount.vaultTokenAccount,
            userAta,
            userCollateral,
        })
            .rpc();
    }
    async settleTrade(input) {
        const marketIdBigInt = BigInt(input.marketId);
        const buyer = new PublicKey(input.buyer);
        const seller = new PublicKey(input.seller);
        const [market] = marketPda(this.client.addresses.marketProgramId, marketIdBigInt);
        const [marketVault] = vaultPda(this.client.addresses.vaultProgramId, marketIdBigInt);
        const [buyerCollateral] = collateralPda(this.client.addresses.vaultProgramId, marketIdBigInt, buyer);
        const [sellerCollateral] = collateralPda(this.client.addresses.vaultProgramId, marketIdBigInt, seller);
        const [buyerPosition] = positionPda(this.client.addresses.vaultProgramId, marketIdBigInt, buyer, "long");
        const [sellerPosition] = positionPda(this.client.addresses.vaultProgramId, marketIdBigInt, seller, "short");
        const quantityUnits = BigInt(Math.round(input.quantity * SCALE));
        return this.client.vaultProgram.methods
            .settleTrade(new BN(input.marketId), buyer, seller, new BN(quantityUnits.toString()), new BN(Math.floor(input.priceScaled).toString()))
            .accounts({
            backendSigner: this.client.provider.wallet.publicKey,
            market,
            marketVault,
            buyerCollateral,
            sellerCollateral,
            buyerPosition,
            sellerPosition,
        })
            .rpc();
    }
    async getLockedBalance(marketId) {
        const [userCollateral] = collateralPda(this.client.addresses.vaultProgramId, BigInt(marketId), this.client.provider.wallet.publicKey);
        const account = await this.client.vaultProgram.account.userCollateral.fetchNullable(userCollateral);
        if (!account)
            return 0;
        return Number(account.totalDeposited) / SCALE;
    }
    async getTotalLocked() {
        const accounts = await this.client.vaultProgram.account.userCollateral.all([
            {
                memcmp: {
                    offset: 16,
                    bytes: this.client.provider.wallet.publicKey.toBase58(),
                },
            },
        ]);
        return (accounts.reduce((acc, row) => acc + Number(row.account.totalDeposited), 0) / SCALE);
    }
}
