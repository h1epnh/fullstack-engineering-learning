import type { Db, IUnleashConfig } from '../../server-impl';
import { ProjectStatusService } from './project-status-service';
export declare const createProjectStatusService: (db: Db, config: IUnleashConfig) => ProjectStatusService;
export declare const createFakeProjectStatusService: () => {
    projectStatusService: ProjectStatusService;
};
//# sourceMappingURL=createProjectStatusService.d.ts.map