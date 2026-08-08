import type { IAuditUser, IUnleashConfig, IUnleashServices, IUnleashStores } from '../../types';
import type { ClientMetricsSchema, FrontendApiFeatureSchema } from '../../openapi';
import type { IApiUser } from '../../types/api-user';
import { type Context } from 'unleash-client';
import { type FrontendSettings } from '../../types/settings/frontend-settings';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache';
export type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi' | 'frontendApiOrigins' | 'eventBus'>;
export type Stores = Pick<IUnleashStores, 'segmentReadModel'>;
export type Services = Pick<IUnleashServices, 'featureToggleService' | 'clientMetricsServiceV2' | 'settingService' | 'configurationRevisionService'>;
export declare class FrontendApiService {
    private readonly config;
    private readonly logger;
    private readonly stores;
    private readonly services;
    private readonly globalFrontendApiCache;
    /**
     * This is intentionally a Promise because we want to be able to await
     * until the client (which might be being created by a different request) is ready
     * Check this test that fails if we don't use a Promise: frontend-api.concurrency.e2e.test.ts
     */
    private readonly clients;
    private cachedFrontendSettings;
    constructor(config: Config, stores: Stores, services: Services, globalFrontendApiCache: GlobalFrontendApiCache);
    getFrontendApiFeatures(token: IApiUser, context: Context): Promise<FrontendApiFeatureSchema[]>;
    registerFrontendApiMetrics(token: IApiUser, metrics: ClientMetricsSchema, ip: string): Promise<void>;
    private clientForFrontendApiToken;
    private createClientForFrontendApiToken;
    deleteClientForFrontendApiToken(secret: string): Promise<void>;
    stopAll(): void;
    refreshData(): Promise<void>;
    private static assertExpectedTokenType;
    setFrontendSettings(value: FrontendSettings, auditUser: IAuditUser): Promise<void>;
    setFrontendCorsSettings(value: FrontendSettings['frontendApiOrigins'], auditUser: IAuditUser): Promise<void>;
    fetchFrontendSettings(): Promise<FrontendSettings>;
    getFrontendSettings(useCache?: boolean): Promise<FrontendSettings>;
}
//# sourceMappingURL=frontend-api-service.d.ts.map