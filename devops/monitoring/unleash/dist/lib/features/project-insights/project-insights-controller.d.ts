import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IProjectParam, type IUnleashConfig, type IUnleashServices } from '../../types';
import { type ProjectInsightsSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
export default class ProjectInsightsController extends Controller {
    private projectInsightsService;
    private openApiService;
    private flagResolver;
    constructor(config: IUnleashConfig, services: IUnleashServices);
    getProjectInsights(req: IAuthRequest<IProjectParam, unknown, unknown, unknown>, res: Response<ProjectInsightsSchema>): Promise<void>;
}
//# sourceMappingURL=project-insights-controller.d.ts.map