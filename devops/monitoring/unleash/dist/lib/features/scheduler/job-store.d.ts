import type { Store } from '../../types/stores/store';
import type { Db, IUnleashConfig } from '../../server-impl';
export type JobModel = {
    name: string;
    bucket: Date;
    stage: 'started' | 'completed' | 'failed';
    finishedAt?: Date;
};
export declare class JobStore implements Store<JobModel, {
    name: string;
    bucket: Date;
}> {
    private logger;
    protected readonly timer: (action: string) => Function;
    private db;
    constructor(db: Db, config: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>);
    acquireBucket(key: string, bucketLengthInMinutes: number): Promise<{
        name: string;
        bucket: Date;
    } | undefined>;
    update(name: string, bucket: Date, data: Partial<Omit<JobModel, 'name' | 'bucket'>>): Promise<JobModel>;
    get(pk: {
        name: string;
        bucket: Date;
    }): Promise<JobModel>;
    getAll(query?: Object | undefined): Promise<JobModel[]>;
    exists(key: {
        name: string;
        bucket: Date;
    }): Promise<boolean>;
    delete(key: {
        name: string;
        bucket: Date;
    }): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    count(): Promise<number>;
}
//# sourceMappingURL=job-store.d.ts.map