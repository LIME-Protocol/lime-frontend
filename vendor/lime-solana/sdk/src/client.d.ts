import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import type { AnchorWalletLike, ProgramAddresses, SolanaConfig } from "./types.js";
export declare class LimeClient {
    readonly provider: AnchorProvider;
    readonly addresses: ProgramAddresses;
    readonly marketProgram: Program;
    readonly vaultProgram: Program;
    readonly settlementProgram: Program;
    constructor(connection: AnchorProvider["connection"], wallet: AnchorWalletLike, config: SolanaConfig);
    toBn(value: bigint | number | string): BN;
}
