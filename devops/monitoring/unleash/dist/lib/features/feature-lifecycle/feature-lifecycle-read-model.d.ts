import type { Db } from '../../db/db';
import type { IFeatureLifecycleReadModel, StageCount, StageCountByProject } from './feature-lifecycle-read-model-type';
import type { IFeatureLifecycleStage, IFlagResolver, IProjectLifecycleStageDuration } from '../../types';
export declare class FeatureLifecycleReadModel implements IFeatureLifecycleReadModel {
    private db;
    private flagResolver;
    constructor(db: Db, flagResolver: IFlagResolver);
    getStageCount(): Promise<StageCount[]>;
    getStageCountByProject(): Promise<StageCountByProject[]>;
    findCurrentStage(feature: string): Promise<IFeatureLifecycleStage | undefined>;
    private getAll;
    getAllWithStageDuration(): Promise<IProjectLifecycleStageDuration[]>;
}
//# sourceMappingURL=feature-lifecycle-read-model.d.ts.map