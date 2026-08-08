import type EventEmitter from 'events';
import type { LogProvider } from '../logger';
import type { IClientInstance, IClientInstanceStore, INewClientInstance } from '../types/stores/client-instance-store';
import type { Db } from './db';
export default class ClientInstanceStore implements IClientInstanceStore {
    private db;
    private logger;
    private eventBus;
    private metricTimer;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider);
    removeInstancesOlderThanTwoDays(): Promise<void>;
    setLastSeen({ appName, instanceId, environment, clientIp, }: INewClientInstance): Promise<void>;
    bulkUpsert(instances: INewClientInstance[]): Promise<void>;
    delete({ appName, instanceId, }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<void>;
    deleteAll(): Promise<void>;
    get({ appName, instanceId, }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<IClientInstance>;
    exists({ appName, instanceId, }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<boolean>;
    insert(details: INewClientInstance): Promise<void>;
    getAll(): Promise<IClientInstance[]>;
    getByAppName(appName: string): Promise<IClientInstance[]>;
    getRecentByAppNameAndEnvironment(appName: string, environment: string): Promise<IClientInstance[]>;
    getBySdkName(sdkName: string): Promise<IClientInstance[]>;
    groupApplicationsBySdk(): Promise<{
        sdkVersion: string;
        applications: string[];
    }[]>;
    groupApplicationsBySdkAndProject(projectId: string): Promise<{
        sdkVersion: string;
        applications: string[];
    }[]>;
    getDistinctApplications(): Promise<string[]>;
    getDistinctApplicationsCount(daysBefore?: number): Promise<number>;
    deleteForApplication(appName: string): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=client-instance-store.d.ts.map