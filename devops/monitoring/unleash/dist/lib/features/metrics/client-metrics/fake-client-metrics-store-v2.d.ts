import EventEmitter from 'events';
import type { IClientMetricsEnv, IClientMetricsEnvKey, IClientMetricsStoreV2 } from './client-metrics-store-v2-type';
export default class FakeClientMetricsStoreV2 extends EventEmitter implements IClientMetricsStoreV2 {
    metrics: IClientMetricsEnv[];
    constructor();
    getFeatureFlagNames(): Promise<string[]>;
    getSeenTogglesForApp(appName: string, hoursBack?: number): Promise<string[]>;
    clearMetrics(hoursBack: number): Promise<void>;
    clearDailyMetrics(daysBack: number): Promise<void>;
    countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    countPreviousDayMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }>;
    aggregateDailyMetrics(): Promise<void>;
    getSeenAppsForFeatureToggle(featureName: string, hoursBack?: number): Promise<string[]>;
    getMetricsForFeatureToggle(featureName: string, hoursBack?: number): Promise<IClientMetricsEnv[]>;
    getMetricsForFeatureToggleV2(featureName: string, hoursBack?: number): Promise<IClientMetricsEnv[]>;
    batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void>;
    get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv>;
    getAll(query?: Object): Promise<IClientMetricsEnv[]>;
    exists(key: IClientMetricsEnvKey): Promise<boolean>;
    delete(key: IClientMetricsEnvKey): Promise<void>;
    getMetricsLastHour(): Promise<[]>;
    insert(): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=fake-client-metrics-store-v2.d.ts.map