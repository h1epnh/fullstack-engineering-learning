import type { IClientSegment, IFeatureStrategySegment, ISegment } from '../../types';
import type { ISegmentReadModel } from './segment-read-model-type';
export declare class FakeSegmentReadModel implements ISegmentReadModel {
    private segments;
    constructor(segments?: ISegment[]);
    getAll(ids?: number[]): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    getActive(): Promise<ISegment[]>;
    getActiveForClient(): Promise<IClientSegment[]>;
    getAllForClientIds(ids?: number[]): Promise<IClientSegment[]>;
}
//# sourceMappingURL=fake-segment-read-model.d.ts.map