import Controller from '../../controller';
import type { IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types';
import type { Request, Response } from 'express';
import type { Operation } from 'fast-json-patch';
import { type IVariant } from '../../../types/model';
import type { IAuthRequest } from '../../unleash-types';
import type { FeatureVariantsSchema } from '../../../openapi/spec/feature-variants-schema';
import type { IUser } from '../../../server-impl';
import type { PushVariantsSchema } from '../../../openapi/spec/push-variants-schema';
interface FeatureEnvironmentParams extends FeatureParams {
    environment: string;
}
interface FeatureParams extends ProjectParam {
    featureName: string;
}
interface ProjectParam {
    projectId: string;
}
export default class VariantsController extends Controller {
    private logger;
    private featureService;
    private accessService;
    constructor(config: IUnleashConfig, { featureToggleService, openApiService, accessService, }: Pick<IUnleashServices, 'featureToggleService' | 'openApiService' | 'accessService'>);
    /**
     * @deprecated - Variants should be fetched from featureService.getVariantsForEnv (since variants are now; since 4.18, connected to environments)
     * @param req
     * @param res
     */
    getVariants(req: Request<FeatureParams, any, any, any>, res: Response<FeatureVariantsSchema>): Promise<void>;
    patchVariants(req: IAuthRequest<FeatureParams, any, Operation[]>, res: Response<FeatureVariantsSchema>): Promise<void>;
    overwriteVariants(req: IAuthRequest<FeatureParams, any, IVariant[], any>, res: Response<FeatureVariantsSchema>): Promise<void>;
    pushVariantsToEnvironments(req: IAuthRequest<FeatureEnvironmentParams, any, PushVariantsSchema, any>, res: Response<FeatureVariantsSchema>): Promise<void>;
    checkAccess(user: IUser, projectId: string, environments: string[], permission: string): Promise<void>;
    getVariantsOnEnv(req: Request<FeatureEnvironmentParams, any, any, any>, res: Response<FeatureVariantsSchema>): Promise<void>;
    patchVariantsOnEnv(req: IAuthRequest<FeatureEnvironmentParams, any, Operation[]>, res: Response<FeatureVariantsSchema>): Promise<void>;
    overwriteVariantsOnEnv(req: IAuthRequest<FeatureEnvironmentParams, any, IVariant[], any>, res: Response<FeatureVariantsSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=variants.d.ts.map