import type { LimeClient } from "./client.js";
import type { OnchainSettlement, PositionSide } from "./types.js";
export declare class SolanaSettlement implements OnchainSettlement {
    private readonly client;
    constructor(client: LimeClient);
    initializeProtocol(resolver: string): Promise<string>;
    initMarketSettlement(marketId: string): Promise<string>;
    resolveMarket(marketId: string, observedValue: number): Promise<string>;
    claimPayout(marketId: string, side?: PositionSide): Promise<string>;
    refundIfInvalidated(marketId: string, side?: PositionSide): Promise<string>;
    getPayoutStatus(marketId: string, side?: PositionSide): Promise<"pending" | "claimable" | "claimed">;
}
