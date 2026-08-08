import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type FeatureLifecycleCompletedSchema, type FeatureLifecycleSchema } from '../../openapi';
import Controller from '../../routes/controller';
import type { Request, Response } from 'express';
import type { IAuthRequest } from '../../routes/unleash-types';
interface FeatureLifecycleParams {
    projectId: string;
    featureName: string;
}
export default class FeatureLifecycleController extends Controller {
    private featureLifecycleService;
    private openApiService;
    private flagResolver;
    constructor(config: IUnleashConfig, { transactionalFeatureLifecycleService, openApiService, }: Pick<IUnleashServices, 'openApiService' | 'transactionalFeatureLifecycleService'>);
    getFeatureLifecycle(req: Request<FeatureLifecycleParams, any, any, any>, res: Response<FeatureLifecycleSchema>): Promise<void>;
    complete(req: IAuthRequest<FeatureLifecycleParams, any, FeatureLifecycleCompletedSchema>, res: Response): Promise<void>;
    uncomplete(req: IAuthRequest<FeatureLifecycleParams>, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=feature-lifecycle-controller.d.ts.map