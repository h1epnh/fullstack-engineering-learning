import type { Request, Response } from 'express';
import Controller from '../controller';
import type { IUnleashServices } from '../../types/services';
import type { IUnleashConfig } from '../../types/option';
import { type EnvironmentsSchema } from '../../openapi/spec/environments-schema';
import { type EnvironmentSchema } from '../../openapi/spec/environment-schema';
import type { SortOrderSchema } from '../../openapi/spec/sort-order-schema';
import { type EnvironmentsProjectSchema } from '../../openapi/spec/environments-project-schema';
interface EnvironmentParam {
    name: string;
}
interface ProjectParam {
    projectId: string;
}
export declare class EnvironmentsController extends Controller {
    private logger;
    private openApiService;
    private service;
    constructor(config: IUnleashConfig, { environmentService, openApiService, }: Pick<IUnleashServices, 'environmentService' | 'openApiService'>);
    getAllEnvironments(req: Request, res: Response<EnvironmentsSchema>): Promise<void>;
    updateSortOrder(req: Request<unknown, unknown, SortOrderSchema>, res: Response): Promise<void>;
    toggleEnvironmentOn(req: Request<EnvironmentParam>, res: Response): Promise<void>;
    toggleEnvironmentOff(req: Request<EnvironmentParam>, res: Response): Promise<void>;
    getEnvironment(req: Request<EnvironmentParam>, res: Response<EnvironmentSchema>): Promise<void>;
    getProjectEnvironments(req: Request<ProjectParam>, res: Response<EnvironmentsProjectSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=environments.d.ts.map