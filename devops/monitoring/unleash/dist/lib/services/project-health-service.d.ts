import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { IProject, IProjectHealthReport } from '../types/model';
import type ProjectService from '../features/project/project-service';
export default class ProjectHealthService {
    private logger;
    private projectStore;
    private featureTypeStore;
    private featureToggleStore;
    private projectService;
    calculateHealthRating: (project: IProject) => Promise<number>;
    constructor({ projectStore, featureTypeStore, featureToggleStore, }: Pick<IUnleashStores, 'projectStore' | 'featureTypeStore' | 'featureToggleStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, projectService: ProjectService);
    getProjectHealthReport(projectId: string): Promise<IProjectHealthReport>;
    setHealthRating(): Promise<void>;
}
//# sourceMappingURL=project-health-service.d.ts.map