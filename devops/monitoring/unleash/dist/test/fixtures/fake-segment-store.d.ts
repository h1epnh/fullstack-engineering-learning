import type { ISegmentStore } from '../../lib/features/segment/segment-store-type';
import type { IFeatureStrategySegment, ISegment } from '../../lib/types/model';
export default class FakeSegmentStore implements ISegmentStore {
    segments: ISegment[];
    currentId: number;
    count(): Promise<number>;
    create(segment: Omit<ISegment, 'id'>): Promise<ISegment>;
    delete(): Promise<void>;
    deleteAll(): Promise<void>;
    exists(): Promise<boolean>;
    get(): Promise<ISegment>;
    getAll(): Promise<ISegment[]>;
    getByStrategy(): Promise<ISegment[]>;
    update(): Promise<ISegment>;
    addToStrategy(): Promise<void>;
    removeFromStrategy(): Promise<void>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    existsByName(name: string): Promise<boolean>;
    destroy(): void;
    getProjectSegmentCount(): Promise<number>;
}
//# sourceMappingURL=fake-segment-store.d.ts.map