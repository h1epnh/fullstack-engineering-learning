import type { ISegmentStore } from './segment-store-type';
import type { IConstraint, IFeatureStrategySegment, ISegment } from '../../types/model';
import type { LogProvider } from '../../logger';
import type EventEmitter from 'events';
import type { PartialSome } from '../../types/partial';
import type { IAuditUser } from '../../types/user';
import type { Db } from '../../db/db';
import type { IFlagResolver } from '../../types';
interface ISegmentRow {
    id: number;
    name: string;
    description?: string;
    segment_project_id?: string;
    created_by?: string;
    created_at: Date;
    used_in_projects?: number;
    used_in_features?: number;
    constraints: IConstraint[];
}
export default class SegmentStore implements ISegmentStore {
    private logger;
    private eventBus;
    private db;
    private flagResolver;
    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider, flagResolver: IFlagResolver);
    count(): Promise<number>;
    create(segment: PartialSome<ISegment, 'id'>, user: Pick<IAuditUser, 'username'>): Promise<ISegment>;
    update(id: number, segment: Omit<ISegment, 'id'>): Promise<ISegment>;
    delete(id: number): Promise<void>;
    getAll(includeChangeRequestUsageData?: boolean): Promise<ISegment[]>;
    private getAllWithoutChangeRequestUsageData;
    private getAllWithChangeRequestUsageData;
    private mapRowsWithUsageData;
    private combineUsageData;
    private mergeCurrentUsageWithCombinedData;
    getByStrategy(strategyId: string): Promise<ISegment[]>;
    deleteAll(): Promise<void>;
    exists(id: number): Promise<boolean>;
    get(id: number): Promise<ISegment>;
    addToStrategy(id: number, strategyId: string): Promise<void>;
    removeFromStrategy(id: number, strategyId: string): Promise<void>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    existsByName(name: string): Promise<boolean>;
    getProjectSegmentCount(projectId: string): Promise<number>;
    prefixColumns(): string[];
    mapRow(row?: ISegmentRow): ISegment;
    destroy(): void;
}
export {};
//# sourceMappingURL=segment-store.d.ts.map