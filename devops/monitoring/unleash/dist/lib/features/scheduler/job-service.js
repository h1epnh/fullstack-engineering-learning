"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const date_fns_1 = require("date-fns");
class JobService {
    constructor(jobStore, logProvider) {
        this.jobStore = jobStore;
        this.logger = logProvider('/services/job-service');
    }
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
    singleInstance(key, fn, bucketSizeInMinutes = 5) {
        return async () => {
            const acquired = await this.jobStore.acquireBucket(key, bucketSizeInMinutes);
            if (acquired) {
                const { name, bucket } = acquired;
                this.logger.info(`Acquired job lock for ${name} from >= ${(0, date_fns_1.subMinutes)(bucket, bucketSizeInMinutes)} to < ${bucket}`);
                try {
                    const range = {
                        from: (0, date_fns_1.subMinutes)(bucket, bucketSizeInMinutes),
                        to: bucket,
                    };
                    const response = await fn(range);
                    await this.jobStore.update(name, bucket, {
                        stage: 'completed',
                        finishedAt: new Date(),
                    });
                    return response;
                }
                catch (err) {
                    this.logger.error(`Failed to execute job ${name}`, err);
                    await this.jobStore.update(name, bucket, {
                        stage: 'failed',
                        finishedAt: new Date(),
                    });
                }
            }
        };
    }
}
exports.JobService = JobService;
//# sourceMappingURL=job-service.js.map