import type EventEmitter from 'events';
import type { IClientApplication, IClientApplications, IClientApplicationsSearchParams, IClientApplicationsStore } from '../types/stores/client-applications-store';
import type { LogProvider } from '../logger';
import type { Db } from './db';
import type { IApplicationOverview } from '../features/metrics/instance/models';
import type { IFlagResolver } from '../types';
export default class ClientApplicationsStore implements IClientApplicationsStore {
    private db;
    private logger;
    private timer;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    upsert(details: Partial<IClientApplication>): Promise<void>;
    bulkUpsert(apps: Partial<IClientApplication>[]): Promise<void>;
    exists(appName: string): Promise<boolean>;
    getAll(): Promise<IClientApplication[]>;
    getApplication(appName: string): Promise<IClientApplication>;
    deleteApplication(appName: string): Promise<void>;
    getApplications(params: IClientApplicationsSearchParams): Promise<IClientApplications>;
    getUnannounced(): Promise<IClientApplication[]>;
    /** *
     * Updates all rows that have announced = false to announced =true and returns the rows altered
     * @return {[app]} - Apps that hadn't been announced
     */
    setUnannouncedToAnnounced(): Promise<IClientApplication[]>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    get(appName: string): Promise<IClientApplication>;
    getApplicationOverview(appName: string): Promise<IApplicationOverview>;
    mapApplicationOverviewData(rows: any[], existingStrategies: string[]): IApplicationOverview;
    private remapUsageRow;
}
//# sourceMappingURL=client-applications-store.d.ts.map