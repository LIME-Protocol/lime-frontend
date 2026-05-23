import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import marketIdl from "../../target/idl/lime_market.json";
import vaultIdl from "../../target/idl/lime_vault.json";
import settlementIdl from "../../target/idl/lime_settlement.json";
export class LimeClient {
    provider;
    addresses;
    marketProgram;
    vaultProgram;
    settlementProgram;
    constructor(connection, wallet, config) {
        this.provider = new AnchorProvider(connection, wallet, {
            commitment: "confirmed",
        });
        this.addresses = {
            marketProgramId: new PublicKey(config.marketProgramId),
            vaultProgramId: new PublicKey(config.vaultProgramId),
            settlementProgramId: new PublicKey(config.settlementProgramId),
            usdcMint: new PublicKey(config.usdcMint),
        };
        this.marketProgram = new Program({ ...marketIdl, address: this.addresses.marketProgramId.toBase58() }, this.provider);
        this.vaultProgram = new Program({ ...vaultIdl, address: this.addresses.vaultProgramId.toBase58() }, this.provider);
        this.settlementProgram = new Program({ ...settlementIdl, address: this.addresses.settlementProgramId.toBase58() }, this.provider);
    }
    toBn(value) {
        return new BN(value.toString());
    }
}
