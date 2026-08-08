import type { IClientSegment, IConstraint, IFeatureStrategySegment, ISegment } from '../../types';
import type { ISegmentReadModel } from './segment-read-model-type';
import type { Db } from '../../db/db';
interface ISegmentRow {
    id: number;
    name: string;
    description?: string;
    segment_project_id?: string;
    created_by?: string;
    created_at: Date;
    constraints: IConstraint[];
}
export declare class SegmentReadModel implements ISegmentReadModel {
    private db;
    constructor(db: Db);
    prefixColumns(): string[];
    mapRow(row?: ISegmentRow): ISegment;
    getAll(ids?: number[]): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    getActive(): Promise<ISegment[]>;
    getActiveForClient(): Promise<IClientSegment[]>;
    getAllForClientIds(ids?: number[]): Promise<IClientSegment[]>;
}
export {};
//# sourceMappingURL=segment-read-model.d.ts.map