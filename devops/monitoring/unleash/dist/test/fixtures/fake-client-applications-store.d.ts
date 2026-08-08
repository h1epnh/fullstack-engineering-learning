import type { IClientApplication, IClientApplications, IClientApplicationsSearchParams, IClientApplicationsStore } from '../../lib/types/stores/client-applications-store';
import type { IApplicationOverview } from '../../lib/features/metrics/instance/models';
export default class FakeClientApplicationsStore implements IClientApplicationsStore {
    apps: IClientApplication[];
    bulkUpsert(details: Partial<IClientApplication>[]): Promise<void>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
    deleteApplication(appName: string): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    get(key: string): Promise<IClientApplication>;
    getAll(): Promise<IClientApplication[]>;
    getApplication(appName: string): Promise<IClientApplication>;
    getApplications(query: IClientApplicationsSearchParams): Promise<IClientApplications>;
    getUnannounced(): Promise<IClientApplication[]>;
    setUnannouncedToAnnounced(): Promise<IClientApplication[]>;
    upsert(details: Partial<IClientApplication>): Promise<void>;
    getApplicationOverview(appName: string): Promise<IApplicationOverview>;
}
//# sourceMappingURL=fake-client-applications-store.d.ts.map