import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type CreateFeatureStrategySchema, type ProjectEnvironmentSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
interface IProjectEnvironmentParams {
    projectId: string;
    environment: string;
}
export default class EnvironmentsController extends Controller {
    private logger;
    private environmentService;
    private openApiService;
    private projectService;
    constructor(config: IUnleashConfig, { transactionalEnvironmentService, openApiService, projectService, }: Pick<IUnleashServices, 'transactionalEnvironmentService' | 'openApiService' | 'projectService'>);
    addEnvironmentToProject(req: IAuthRequest<Omit<IProjectEnvironmentParams, 'environment'>, void, ProjectEnvironmentSchema>, res: Response): Promise<void>;
    removeEnvironmentFromProject(req: IAuthRequest<IProjectEnvironmentParams>, res: Response<void>): Promise<void>;
    updateDefaultStrategyForProjectEnvironment(req: IAuthRequest<IProjectEnvironmentParams, CreateFeatureStrategySchema>, res: Response<CreateFeatureStrategySchema>): Promise<void>;
}
export {};
//# sourceMappingURL=environments.d.ts.map