import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type CreateDependentFeatureSchema, type ParentFeatureOptionsSchema, type ParentVariantOptionsSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
interface ProjectParams {
    projectId: string;
}
interface FeatureParams extends ProjectParams {
    child: string;
}
interface ParentVariantsParams extends ProjectParams {
    parent: string;
}
interface DeleteDependencyParams extends ProjectParams {
    child: string;
    parent: string;
}
type DependentFeaturesServices = Pick<IUnleashServices, 'transactionalDependentFeaturesService' | 'openApiService'>;
export default class DependentFeaturesController extends Controller {
    private dependentFeaturesService;
    private openApiService;
    private flagResolver;
    private readonly logger;
    constructor(config: IUnleashConfig, { transactionalDependentFeaturesService, openApiService, }: DependentFeaturesServices);
    addFeatureDependency(req: IAuthRequest<FeatureParams, any, CreateDependentFeatureSchema>, res: Response): Promise<void>;
    deleteFeatureDependency(req: IAuthRequest<DeleteDependencyParams, any, any>, res: Response): Promise<void>;
    deleteFeatureDependencies(req: IAuthRequest<FeatureParams, any, any>, res: Response): Promise<void>;
    getPossibleParentFeatures(req: IAuthRequest<FeatureParams, any, any>, res: Response<ParentFeatureOptionsSchema>): Promise<void>;
    getPossibleParentVariants(req: IAuthRequest<ParentVariantsParams, any, any>, res: Response<ParentVariantOptionsSchema>): Promise<void>;
    checkDependenciesExist(req: IAuthRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=dependent-features-controller.d.ts.map