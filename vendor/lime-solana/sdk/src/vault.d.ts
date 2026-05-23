import type { LimeClient } from "./client.js";
import type { OnchainCollateral, OnchainTradeExecution, PositionSide, TradeExecutionInput } from "./types.js";
export declare class SolanaCollateral implements OnchainCollateral, OnchainTradeExecution {
    private readonly client;
    constructor(client: LimeClient);
    initMarketVault(marketId: string, vaultTokenAccount: string): Promise<string>;
    lockCollateral(marketId: string, amount: number, _side?: PositionSide): Promise<string>;
    depositCollateral(marketId: string, amount: number): Promise<string>;
    releaseCollateral(marketId: string, amount: number): Promise<string>;
    withdrawAvailableCollateral(marketId: string, amount: number): Promise<string>;
    settleTrade(input: TradeExecutionInput): Promise<string>;
    getLockedBalance(marketId: string): Promise<number>;
    getTotalLocked(): Promise<number>;
}
