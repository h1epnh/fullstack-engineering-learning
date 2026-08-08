import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../types/option';
import type { IUnleashServices } from '../types/services';
import Controller from './controller';
import type { HealthCheckSchema } from '../openapi/spec/health-check-schema';
export declare class HealthCheckController extends Controller {
    private logger;
    private openApiService;
    constructor(config: IUnleashConfig, { openApiService }: Pick<IUnleashServices, 'openApiService'>);
    getHealth(_: Request, res: Response<HealthCheckSchema>): Promise<void>;
}
//# sourceMappingURL=health-check.d.ts.map