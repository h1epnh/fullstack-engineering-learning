import type { JobStore } from './job-store';
import type { LogProvider } from '../../logger';
export declare class JobService {
    private jobStore;
    private logger;
    constructor(jobStore: JobStore, logProvider: LogProvider);
    /**
     * Wraps a function in a job that will guarantee the function is executed
     * in a mutually exclusive way in a single instance of the cluster, at most
     * once every {@param bucketSizeInMinutes}.
     *
     * The key identifies the job group: only one job in the group will execute
     * at any given time.
     *
     * Note: buckets begin at the start of the time span
     */
    singleInstance(key: string, fn: (range?: {
        from: Date;
        to: Date;
    }) => Promise<unknown>, bucketSizeInMinutes?: number): () => Promise<unknown>;
}
//# sourceMappingURL=job-service.d.ts.map