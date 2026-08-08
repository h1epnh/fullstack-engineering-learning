import type { Db } from '../../db/db';
import type { LogProvider } from '../../logger';
import type { IStatMonthlyTrafficUsage, IStatTrafficUsage, IStatTrafficUsageKey, ITrafficDataUsageStore } from './traffic-data-usage-store-type';
export declare class TrafficDataUsageStore implements ITrafficDataUsageStore {
    private db;
    private logger;
    constructor(db: Db, getLogger: LogProvider);
    get(key: IStatTrafficUsageKey): Promise<IStatTrafficUsage>;
    getAll(query?: {}): Promise<IStatTrafficUsage[]>;
    exists(key: IStatTrafficUsageKey): Promise<boolean>;
    delete(key: IStatTrafficUsageKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    upsert(trafficDataUsage: IStatTrafficUsage): Promise<void>;
    getDailyTrafficDataUsageForPeriod(from: Date, to: Date): Promise<IStatTrafficUsage[]>;
    getMonthlyTrafficDataUsageForPeriod(from: Date, to: Date): Promise<IStatMonthlyTrafficUsage[]>;
    getTrafficDataUsageForPeriod(period: string): Promise<IStatTrafficUsage[]>;
}
//# sourceMappingURL=traffic-data-usage-store.d.ts.map