import type { Db } from '../../db/db';
import type { ChangeRequestStrategy, IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';
export declare class ChangeRequestSegmentUsageReadModel implements IChangeRequestSegmentUsageReadModel {
    private db;
    constructor(db: Db);
    getStrategiesUsedInActiveChangeRequests(segmentId: number): Promise<ChangeRequestStrategy[]>;
}
//# sourceMappingURL=sql-change-request-segment-usage-read-model.d.ts.map