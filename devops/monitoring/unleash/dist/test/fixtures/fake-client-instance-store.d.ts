import type { IClientInstance, IClientInstanceStore, INewClientInstance } from '../../lib/types/stores/client-instance-store';
export default class FakeClientInstanceStore implements IClientInstanceStore {
    instances: IClientInstance[];
    bulkUpsert(instances: INewClientInstance[]): Promise<void>;
    delete(key: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<void>;
    setLastSeen(): Promise<void>;
    getBySdkName(sdkName: string): Promise<IClientInstance[]>;
    groupApplicationsBySdk(): Promise<{
        sdkVersion: string;
        applications: string[];
    }[]>;
    groupApplicationsBySdkAndProject(projectId: string): Promise<{
        sdkVersion: string;
        applications: string[];
    }[]>;
    deleteAll(): Promise<void>;
    deleteForApplication(appName: string): Promise<void>;
    destroy(): void;
    exists(key: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<boolean>;
    get(key: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<IClientInstance>;
    getAll(): Promise<IClientInstance[]>;
    getByAppName(appName: string): Promise<IClientInstance[]>;
    getRecentByAppNameAndEnvironment(appName: string, environment: string): Promise<IClientInstance[]>;
    getDistinctApplications(): Promise<string[]>;
    getDistinctApplicationsCount(): Promise<number>;
    insert(details: INewClientInstance): Promise<void>;
    removeInstancesOlderThanTwoDays(): Promise<void>;
}
//# sourceMappingURL=fake-client-instance-store.d.ts.map