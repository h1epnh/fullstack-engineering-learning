import type { Db } from '../../server-impl';
export type GetProductionChanges = () => Promise<{
    last30: number;
    last60: number;
    last90: number;
}>;
export declare const createGetProductionChanges: (db: Db) => GetProductionChanges;
export declare const createFakeGetProductionChanges: (changesInProduction?: Awaited<ReturnType<GetProductionChanges>>) => GetProductionChanges;
//# sourceMappingURL=getProductionChanges.d.ts.map