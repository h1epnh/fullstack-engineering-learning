import type { Db } from '../../server-impl';
export type GetActiveUsers = () => Promise<{
    last7: number;
    last30: number;
    last60: number;
    last90: number;
}>;
export declare const createGetActiveUsers: (db: Db) => GetActiveUsers;
export declare const createFakeGetActiveUsers: (activeUsers?: Awaited<ReturnType<GetActiveUsers>>) => GetActiveUsers;
//# sourceMappingURL=getActiveUsers.d.ts.map