import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type PersonalDashboardSchema } from '../../openapi';
import Controller from '../../routes/controller';
import type { Response } from 'express';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type PersonalDashboardProjectDetailsSchema } from '../../openapi/spec/personal-dashboard-project-details-schema';
export default class PersonalDashboardController extends Controller {
    private openApiService;
    private personalDashboardService;
    constructor(config: IUnleashConfig, { openApiService, personalDashboardService, }: Pick<IUnleashServices, 'openApiService' | 'personalDashboardService'>);
    getPersonalDashboard(req: IAuthRequest, res: Response<PersonalDashboardSchema>): Promise<void>;
    getPersonalDashboardProjectDetails(req: IAuthRequest<{
        projectId: string;
    }>, res: Response<PersonalDashboardProjectDetailsSchema>): Promise<void>;
}
//# sourceMappingURL=personal-dashboard-controller.d.ts.map