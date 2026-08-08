import type { LogProvider } from '../../../logger';
import type { IClientMetricsEnv, IClientMetricsEnvKey, IClientMetricsStoreV2 } from './client-metrics-store-v2-type';
import type { Db } from '../../../db/db';
import type { IFlagResolver } from '../../../types';
export declare class ClientMetricsStoreV2 implements IClientMetricsStoreV2 {
    private db;
    private logger;
    private flagResolver;
    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver);
    get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv>;
    getFeatureFlagNames(): Promise<string[]>;
    getAll(query?: Object): Promise<IClientMetricsEnv[]>;
    exists(key: IClientMetricsEnvKey): Promise<boolean>;
    delete(key: IClientMetricsEnvKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void>;
    getMetricsForFeatureToggle(featureName: string, hoursBack?: number): Promise<IClientMetricsEnv[]>;
    getMetricsForFeatureToggleV2(featureName: string, hoursBack?: number): Promise<IClientMetricsEnv[]>;
    getSeenAppsForFeatureToggle(featureName: string, hoursBack?: number): Promise<string[]>;
    getSeenTogglesForApp(appName: string, hoursBack?: number): Promise<string[]>;
    clearMetrics(hoursAgo: number): Promise<void>;
    clearDailyMetrics(daysAgo: number): Promise<void>;
    countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    countPreviousDayMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    aggregateDailyMetrics(): Promise<void>;
}
//# sourceMappingURL=client-metrics-store-v2.d.ts.map