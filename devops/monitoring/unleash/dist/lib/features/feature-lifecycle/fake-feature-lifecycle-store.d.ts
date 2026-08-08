import type { FeatureLifecycleStage, IFeatureLifecycleStore, FeatureLifecycleView, NewStage } from './feature-lifecycle-store-type';
export declare class FakeFeatureLifecycleStore implements IFeatureLifecycleStore {
    private lifecycles;
    insert(featureLifecycleStages: FeatureLifecycleStage[]): Promise<NewStage[]>;
    backfill(): Promise<void>;
    private insertOne;
    get(feature: string): Promise<FeatureLifecycleView>;
    delete(feature: string): Promise<void>;
    deleteAll(): Promise<void>;
    stageExists(stage: FeatureLifecycleStage): Promise<boolean>;
    deleteStage(stage: FeatureLifecycleStage): Promise<void>;
}
//# sourceMappingURL=fake-feature-lifecycle-store.d.ts.map