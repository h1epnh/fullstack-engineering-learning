import type { FeatureLifecycleStage, IFeatureLifecycleStore, FeatureLifecycleView, FeatureLifecycleProjectItem, NewStage } from './feature-lifecycle-store-type';
import type { Db } from '../../db/db';
export declare class FeatureLifecycleStore implements IFeatureLifecycleStore {
    private db;
    constructor(db: Db);
    backfill(): Promise<void>;
    insert(featureLifecycleStages: FeatureLifecycleStage[]): Promise<NewStage[]>;
    get(feature: string): Promise<FeatureLifecycleView>;
    getAll(): Promise<FeatureLifecycleProjectItem[]>;
    delete(feature: string): Promise<void>;
    deleteAll(): Promise<void>;
    deleteStage(stage: FeatureLifecycleStage): Promise<void>;
    stageExists(stage: FeatureLifecycleStage): Promise<boolean>;
}
//# sourceMappingURL=feature-lifecycle-store.d.ts.map