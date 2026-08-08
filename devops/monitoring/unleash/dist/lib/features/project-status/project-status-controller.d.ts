import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IProjectParam, type IUnleashConfig, type IUnleashServices } from '../../types';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type ProjectStatusSchema } from '../../openapi';
export default class ProjectStatusController extends Controller {
    private projectStatusService;
    private openApiService;
    private flagResolver;
    constructor(config: IUnleashConfig, services: IUnleashServices);
    getProjectStatus(req: IAuthRequest<IProjectParam, unknown, unknown, unknown>, res: Response<ProjectStatusSchema>): Promise<void>;
}
//# sourceMappingURL=project-status-controller.d.ts.map