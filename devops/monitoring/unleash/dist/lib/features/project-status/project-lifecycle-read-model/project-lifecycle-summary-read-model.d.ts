import type { Db } from '../../../db/db';
import type { IFeatureToggleStore } from '../../../types';
import type { IProjectLifecycleSummaryReadModel, ProjectLifecycleSummary } from './project-lifecycle-read-model-type';
type FlagsInStage = {
    initial: number;
    'pre-live': number;
    live: number;
    completed: number;
    archived: number;
};
type AverageTimeInStage = {
    initial: number | null;
    'pre-live': number | null;
    live: number | null;
    completed: number | null;
};
export declare class ProjectLifecycleSummaryReadModel implements IProjectLifecycleSummaryReadModel {
    private db;
    private featureToggleStore;
    constructor(db: Db, featureToggleStore: IFeatureToggleStore);
    getAverageTimeInEachStage(projectId: string): Promise<AverageTimeInStage>;
    getCurrentFlagsInEachStage(projectId: string): Promise<FlagsInStage>;
    getArchivedFlagsLast30Days(projectId: string): Promise<number>;
    getProjectLifecycleSummary(projectId: string): Promise<ProjectLifecycleSummary>;
}
export {};
//# sourceMappingURL=project-lifecycle-summary-read-model.d.ts.map