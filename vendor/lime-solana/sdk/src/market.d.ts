import type { LimeClient } from "./client.js";
import type { MarketInput } from "./types.js";
export declare class SolanaMarketService {
    private readonly client;
    constructor(client: LimeClient);
    initializeProtocol(feeBps?: number): Promise<string>;
    createMarket(input: MarketInput): Promise<string>;
    activateMarket(marketId: bigint): Promise<string>;
    closeMarket(marketId: bigint): Promise<string>;
    markResolved(marketId: bigint): Promise<string>;
    markSettled(marketId: bigint): Promise<string>;
}
