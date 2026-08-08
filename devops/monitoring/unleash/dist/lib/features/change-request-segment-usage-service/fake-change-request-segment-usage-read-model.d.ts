import type { ChangeRequestStrategy, IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';
export declare class FakeChangeRequestSegmentUsageReadModel implements IChangeRequestSegmentUsageReadModel {
    strategiesUsedInActiveChangeRequests: ChangeRequestStrategy[];
    constructor(strategiesUsedInActiveChangeRequests?: never[]);
    getStrategiesUsedInActiveChangeRequests(): Promise<ChangeRequestStrategy[]>;
}
//# sourceMappingURL=fake-change-request-segment-usage-read-model.d.ts.map