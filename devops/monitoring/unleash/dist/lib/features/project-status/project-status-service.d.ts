import type { ProjectStatusSchema } from '../../openapi';
import type { IUnleashStores } from '../../types';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model/project-lifecycle-read-model-type';
import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model/project-stale-flags-read-model-type';
export declare class ProjectStatusService {
    private eventStore;
    private projectStore;
    private apiTokenStore;
    private segmentStore;
    private projectLifecycleSummaryReadModel;
    private projectStaleFlagsReadModel;
    private featureTypeStore;
    private featureToggleStore;
    constructor({ eventStore, projectStore, apiTokenStore, segmentStore, featureTypeStore, featureToggleStore, }: Pick<IUnleashStores, 'eventStore' | 'projectStore' | 'apiTokenStore' | 'segmentStore' | 'featureTypeStore' | 'featureToggleStore'>, projectLifecycleReadModel: IProjectLifecycleSummaryReadModel, projectStaleFlagsReadModel: IProjectStaleFlagsReadModel);
    getProjectStatus(projectId: string): Promise<ProjectStatusSchema>;
}
//# sourceMappingURL=project-status-service.d.ts.map