import type { IApplication, IApplicationOverview } from './models';
import type { IUnleashStores } from '../../../types/stores';
import type { IUnleashConfig } from '../../../types/option';
import type { IClientApplications, IClientApplicationsSearchParams } from '../../../types/stores/client-applications-store';
import type { IClientApp } from '../../../types/model';
import type { PartialSome } from '../../../types/partial';
import type { IPrivateProjectChecker } from '../../private-project/privateProjectCheckerType';
import type { Logger } from '../../../logger';
import type { OutdatedSdksSchema } from '../../../openapi/spec/outdated-sdks-schema';
export default class ClientInstanceService {
    apps: {};
    logger: Logger;
    seenClients: Record<string, IClientApp>;
    private clientMetricsStoreV2;
    private strategyStore;
    private featureToggleStore;
    private clientApplicationsStore;
    private clientInstanceStore;
    private eventStore;
    private privateProjectChecker;
    private flagResolver;
    private eventBus;
    constructor({ clientMetricsStoreV2, strategyStore, featureToggleStore, clientInstanceStore, clientApplicationsStore, eventStore, }: Pick<IUnleashStores, 'clientMetricsStoreV2' | 'strategyStore' | 'featureToggleStore' | 'clientApplicationsStore' | 'clientInstanceStore' | 'eventStore'>, { getLogger, flagResolver, eventBus, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>, privateProjectChecker: IPrivateProjectChecker);
    registerInstance(data: PartialSome<IClientApp, 'instanceId'>, clientIp: string): Promise<void>;
    registerClient(data: PartialSome<IClientApp, 'instanceId'>, clientIp: string): Promise<void>;
    announceUnannounced(): Promise<void>;
    clientKey(client: IClientApp): string;
    bulkAdd(): Promise<void>;
    getApplications(query: IClientApplicationsSearchParams, userId: number): Promise<IClientApplications>;
    getApplication(appName: string): Promise<IApplication>;
    getApplicationOverview(appName: string, userId: number): Promise<IApplicationOverview>;
    getRecentApplicationEnvironmentInstances(appName: string, environment: string): Promise<{
        instanceId: string;
        clientIp: string | undefined;
        sdkVersion: string | undefined;
        lastSeen: Date | undefined;
    }[]>;
    deleteApplication(appName: string): Promise<void>;
    createApplication(input: IApplication): Promise<void>;
    removeInstancesOlderThanTwoDays(): Promise<void>;
    getOutdatedSdks(): Promise<OutdatedSdksSchema['sdks']>;
    getOutdatedSdksByProject(projectId: string): Promise<OutdatedSdksSchema['sdks']>;
    usesSdkOlderThan(sdkName: string, sdkVersion: string): Promise<boolean>;
}
//# sourceMappingURL=instance-service.d.ts.map