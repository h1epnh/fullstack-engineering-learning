import type { IFeatureLifecycleStage, IProjectLifecycleStageDuration, StageName } from '../../types';
export type StageCount = {
    stage: StageName;
    count: number;
};
export type StageCountByProject = StageCount & {
    project: string;
};
export interface IFeatureLifecycleReadModel {
    findCurrentStage(feature: string): Promise<IFeatureLifecycleStage | undefined>;
    getStageCount(): Promise<StageCount[]>;
    getStageCountByProject(): Promise<StageCountByProject[]>;
    getAllWithStageDuration(): Promise<IProjectLifecycleStageDuration[]>;
}
//# sourceMappingURL=feature-lifecycle-read-model-type.d.ts.map