import { Transaction } from "@iota/core";
export declare enum DIRECTION {
    NONE = 0,
    FORWARD = 1,
    BACKWARD = 2
}
export interface QueryRequest {
    addresses?: string[];
    bundles?: string[];
}
export declare function QueryTransactions(txs: string[]): Promise<string[]>;
export declare function QueryAddress(addr: string, maxQueryDepth: number, queryDirection?: DIRECTION, refresh?: boolean, useCache?: boolean, callback?: (processedTXCount: number, foundTXCount: number, depth: number) => void): Promise<string[]>;
export declare function QueryBundles(bundles: string[], queryDirection?: DIRECTION, store?: boolean, refresh?: boolean): Promise<string[]>;
export declare function Query(request: QueryRequest): Promise<Transaction[]>;
export declare function GetInclusionStates(transactions: string[]): Promise<boolean[]>;
export declare function getReceivingAddress(transactions: string): Promise<string>;
