import { type IUnleashConfig } from '../../../types';
import type { IUnleashStores } from '../../../types';
import type { ToggleMetricsSummary } from '../../../types/models/metrics';
import type { IClientMetricsEnv } from './client-metrics-store-v2-type';
import { type IApiUser } from '../../../types/api-user';
import type { IUser } from '../../../types/user';
import type { LastSeenService } from '../last-seen/last-seen-service';
import type { ClientMetricsSchema } from '../../../../lib/openapi';
export default class ClientMetricsServiceV2 {
    private config;
    private unsavedMetrics;
    private clientMetricsStoreV2;
    private lastSeenService;
    private flagResolver;
    private logger;
    private cachedFeatureNames;
    constructor({ clientMetricsStoreV2 }: Pick<IUnleashStores, 'clientMetricsStoreV2'>, config: IUnleashConfig, lastSeenService: LastSeenService);
    clearMetrics(hoursAgo: number): Promise<void>;
    clearDailyMetrics(daysAgo: number): Promise<void>;
    aggregateDailyMetrics(): Promise<void>;
    filterExistingToggleNames(toggleNames: string[]): Promise<string[]>;
    filterValidToggleNames(toggleNames: string[]): Promise<string[]>;
    registerBulkMetrics(metrics: IClientMetricsEnv[]): Promise<void>;
    registerClientMetrics(data: ClientMetricsSchema, clientIp: string): Promise<void>;
    bulkAdd(): Promise<void>;
    getFeatureToggleMetricsSummary(featureName: string): Promise<ToggleMetricsSummary>;
    getClientMetricsForToggle(featureName: string, hoursBack?: number): Promise<IClientMetricsEnv[]>;
    resolveMetricsEnvironment(user: IUser | IApiUser, data: {
        environment?: string;
    }): string;
    resolveUserEnvironment(user: IUser | IApiUser): string;
}
//# sourceMappingURL=metrics-service-v2.d.ts.map