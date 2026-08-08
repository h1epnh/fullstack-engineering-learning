import type { IFeatureLifecycleReadModel, StageCount, StageCountByProject } from './feature-lifecycle-read-model-type';
import type { IFeatureLifecycleStage, IProjectLifecycleStageDuration } from '../../types';
export declare class FakeFeatureLifecycleReadModel implements IFeatureLifecycleReadModel {
    getAllWithStageDuration(): Promise<IProjectLifecycleStageDuration[]>;
    getStageCount(): Promise<StageCount[]>;
    getStageCountByProject(): Promise<StageCountByProject[]>;
    findCurrentStage(feature: string): Promise<IFeatureLifecycleStage | undefined>;
}
//# sourceMappingURL=fake-feature-lifecycle-read-model.d.ts.map