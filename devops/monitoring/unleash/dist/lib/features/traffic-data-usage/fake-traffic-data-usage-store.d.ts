import type { IStatTrafficUsageKey, IStatTrafficUsage, IStatMonthlyTrafficUsage } from './traffic-data-usage-store-type';
import type { ITrafficDataUsageStore } from '../../types';
export declare class FakeTrafficDataUsageStore implements ITrafficDataUsageStore {
    private trafficData;
    get(key: IStatTrafficUsageKey): Promise<IStatTrafficUsage>;
    getAll(query?: Object | undefined): Promise<IStatTrafficUsage[]>;
    exists(key: IStatTrafficUsageKey): Promise<boolean>;
    delete(key: IStatTrafficUsageKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    upsert(trafficDataUsage: IStatTrafficUsage): Promise<void>;
    getTrafficDataUsageForPeriod(period: string): Promise<IStatTrafficUsage[]>;
    getTrafficDataForMonthRange(monthsBack: number): Promise<IStatMonthlyTrafficUsage[]>;
    getDailyTrafficDataUsageForPeriod(from: Date, to: Date): Promise<IStatTrafficUsage[]>;
    getMonthlyTrafficDataUsageForPeriod(from: Date, to: Date): Promise<IStatMonthlyTrafficUsage[]>;
}
//# sourceMappingURL=fake-traffic-data-usage-store.d.ts.map