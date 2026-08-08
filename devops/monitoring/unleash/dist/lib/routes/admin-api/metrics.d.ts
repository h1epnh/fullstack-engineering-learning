import type { Request, Response } from 'express';
import Controller from '../controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { ApplicationSchema } from '../../openapi/spec/application-schema';
import type { ApplicationsSchema } from '../../openapi/spec/applications-schema';
import type { CreateApplicationSchema } from '../../openapi/spec/create-application-schema';
import type { IAuthRequest } from '../unleash-types';
import { type ApplicationOverviewSchema } from '../../openapi/spec/application-overview-schema';
import { type ApplicationEnvironmentInstancesSchema } from '../../openapi/spec/application-environment-instances-schema';
import { type OutdatedSdksSchema } from '../../openapi/spec/outdated-sdks-schema';
declare class MetricsController extends Controller {
    private logger;
    private clientInstanceService;
    private flagResolver;
    private openApiService;
    constructor(config: IUnleashConfig, { clientInstanceService, openApiService, }: Pick<IUnleashServices, 'clientInstanceService' | 'openApiService'>);
    deprecated(req: Request, res: Response): Promise<void>;
    deleteApplication(req: Request<{
        appName: string;
    }>, res: Response): Promise<void>;
    createApplication(req: Request<{
        appName: string;
    }, unknown, CreateApplicationSchema>, res: Response): Promise<void>;
    getApplications(req: IAuthRequest, res: Response<ApplicationsSchema>): Promise<void>;
    getApplication(req: Request<{
        appName: string;
    }>, res: Response<ApplicationSchema>): Promise<void>;
    getApplicationOverview(req: IAuthRequest<{
        appName: string;
    }>, res: Response<ApplicationOverviewSchema>): Promise<void>;
    getOutdatedSdks(req: Request, res: Response<OutdatedSdksSchema>): Promise<void>;
    getApplicationEnvironmentInstances(req: Request<{
        appName: string;
        environment: string;
    }>, res: Response<ApplicationEnvironmentInstancesSchema>): Promise<void>;
}
export default MetricsController;
//# sourceMappingURL=metrics.d.ts.map