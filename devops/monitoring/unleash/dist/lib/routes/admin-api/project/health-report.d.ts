import type { Request, Response } from 'express';
import Controller from '../../controller';
import type { IUnleashServices } from '../../../types/services';
import type { IUnleashConfig } from '../../../types/option';
import type { IProjectParam } from '../../../types/model';
import { type HealthReportSchema } from '../../../openapi/spec/health-report-schema';
export default class ProjectHealthReport extends Controller {
    private projectHealthService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { projectHealthService, openApiService, }: Pick<IUnleashServices, 'projectHealthService' | 'openApiService'>);
    getProjectHealthReport(req: Request<IProjectParam>, res: Response<HealthReportSchema>): Promise<void>;
}
//# sourceMappingURL=health-report.d.ts.map