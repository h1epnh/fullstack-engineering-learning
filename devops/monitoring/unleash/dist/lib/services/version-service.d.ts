import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
export interface IVersionInfo {
    oss: string;
    enterprise?: string;
}
export interface IVersionHolder {
    current: IVersionInfo;
    latest: Partial<IVersionInfo>;
    isLatest: boolean;
    instanceId: string;
    buildDate?: string;
}
export interface IVersionResponse {
    versions: IVersionInfo;
    latest: boolean;
}
export interface IFeatureUsageInfo {
    instanceId: string;
    versionOSS: string;
    versionEnterprise?: string;
    users: number;
    featureToggles: number;
    projects: number;
    contextFields: number;
    roles: number;
    customRootRoles: number;
    featureExports: number;
    featureImports: number;
    groups: number;
    environments: number;
    segments: number;
    strategies: number;
    SAMLenabled: boolean;
    OIDCenabled: boolean;
    customStrategies: number;
    customStrategiesInUse: number;
    activeUsers30: number;
    activeUsers60: number;
    activeUsers90: number;
    productionChanges30: number;
    productionChanges60: number;
    productionChanges90: number;
    postgresVersion: string;
}
export default class VersionService {
    private logger;
    private settingStore;
    private current;
    private latest?;
    private enabled;
    private telemetryEnabled;
    private versionCheckUrl?;
    private instanceId?;
    private isLatest;
    private timer;
    private readonly buildDate?;
    constructor({ settingStore }: Pick<IUnleashStores, 'settingStore'>, { getLogger, versionCheck, enterpriseVersion, telemetry, buildDate, }: Pick<IUnleashConfig, 'getLogger' | 'versionCheck' | 'enterpriseVersion' | 'telemetry' | 'buildDate'>);
    private readInstanceId;
    getInstanceId(): Promise<string | undefined>;
    checkLatestVersion(telemetryDataProvider: () => Promise<IFeatureUsageInfo>): Promise<void>;
    getVersionInfo(): Promise<IVersionHolder>;
}
//# sourceMappingURL=version-service.d.ts.map