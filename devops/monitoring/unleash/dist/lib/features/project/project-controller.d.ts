import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IArchivedQuery, type IProjectParam, type IUnleashConfig, type IUnleashServices } from '../../types';
import { type DeprecatedProjectOverviewSchema, type OutdatedSdksSchema, type ProjectDoraMetricsSchema, type ProjectsSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { Db } from '../../db/db';
import type { ProjectOverviewSchema } from '../../openapi/spec/project-overview-schema';
import { type ProjectApplicationsSchema } from '../../openapi/spec/project-applications-schema';
import { type ProjectFlagCreatorsSchema } from '../../openapi/spec/project-flag-creators-schema';
export default class ProjectController extends Controller {
    private projectService;
    private openApiService;
    private clientInstanceService;
    private flagResolver;
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db);
    getProjects(req: IAuthRequest, res: Response<ProjectsSchema>): Promise<void>;
    getDeprecatedProjectOverview(req: IAuthRequest<IProjectParam, unknown, unknown, IArchivedQuery>, res: Response<DeprecatedProjectOverviewSchema>): Promise<void>;
    getProjectOverview(req: IAuthRequest<IProjectParam, unknown, unknown, IArchivedQuery>, res: Response<ProjectOverviewSchema>): Promise<void>;
    /** @deprecated use projectInsights instead */
    getProjectDora(req: IAuthRequest, res: Response<ProjectDoraMetricsSchema>): Promise<void>;
    getProjectApplications(req: IAuthRequest, res: Response<ProjectApplicationsSchema>): Promise<void>;
    getProjectFlagCreators(req: IAuthRequest<IProjectParam>, res: Response<ProjectFlagCreatorsSchema>): Promise<void>;
    getOutdatedProjectSdks(req: IAuthRequest<IProjectParam>, res: Response<OutdatedSdksSchema>): Promise<void>;
}
//# sourceMappingURL=project-controller.d.ts.map