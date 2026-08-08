import type { Request, Response } from 'express';
import { type Operation } from 'fast-json-patch';
import Controller from '../../routes/controller';
import { type FeatureToggleView, type IUnleashConfig, type IUnleashServices } from '../../types';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type AdminFeaturesQuerySchema, type BulkToggleFeaturesSchema, type CreateFeatureSchema, type CreateFeatureStrategySchema, type FeatureEnvironmentSchema, type FeatureSchema, type FeatureStrategySchema, type ProjectFeaturesSchema, type SetStrategySortOrderSchema, type TagsBulkAddSchema, type TagSchema, type UpdateFeatureSchema, type UpdateFeatureStrategySchema } from '../../openapi';
import type { BatchStaleSchema } from '../../openapi/spec/batch-stale-schema';
import type { TransactionCreator, UnleashTransaction } from '../../db/transaction';
interface FeatureStrategyParams {
    projectId: string;
    featureName: string;
    environment: string;
    sortOrder?: number;
}
interface BulkFeaturesStrategyParams {
    projectId: string;
    environment: string;
}
interface FeatureStrategyQuery {
    shouldActivateDisabledStrategies: string;
}
interface FeatureParams extends ProjectParam {
    featureName: string;
}
interface ProjectParam {
    projectId: string;
}
interface StrategyIdParams extends FeatureStrategyParams {
    strategyId: string;
}
export interface IFeatureProjectUserParams extends ProjectParam {
    archived?: boolean;
    userId?: number;
    tag?: string[][];
    namePrefix?: string;
}
type ProjectFeaturesServices = Pick<IUnleashServices, 'featureToggleService' | 'projectHealthService' | 'openApiService' | 'transactionalFeatureToggleService' | 'featureTagService'>;
export default class ProjectFeaturesController extends Controller {
    private featureService;
    private featureTagService;
    private transactionalFeatureToggleService;
    private openApiService;
    private flagResolver;
    private readonly logger;
    private readonly startTransaction;
    constructor(config: IUnleashConfig, { featureToggleService, openApiService, transactionalFeatureToggleService, featureTagService, }: ProjectFeaturesServices, startTransaction: TransactionCreator<UnleashTransaction>);
    getFeatures(req: IAuthRequest<ProjectParam, any, any, AdminFeaturesQuerySchema>, res: Response<ProjectFeaturesSchema>): Promise<void>;
    prepQuery({ tag, namePrefix }: AdminFeaturesQuerySchema, projectId: string): Promise<IFeatureProjectUserParams>;
    paramToArray(param: any): Array<any>;
    cloneFeature(req: IAuthRequest<FeatureParams, any, {
        name: string;
        replaceGroupId?: boolean;
    }>, res: Response<FeatureSchema>): Promise<void>;
    createFeature(req: IAuthRequest<FeatureParams, FeatureSchema, CreateFeatureSchema>, res: Response<FeatureSchema>): Promise<void>;
    maybeAnonymise(feature: FeatureToggleView): FeatureToggleView;
    getFeature(req: IAuthRequest<FeatureParams, any, any, any>, res: Response<FeatureSchema>): Promise<void>;
    updateFeature(req: IAuthRequest<{
        projectId: string;
        featureName: string;
    }, any, UpdateFeatureSchema>, res: Response<FeatureSchema>): Promise<void>;
    patchFeature(req: IAuthRequest<{
        projectId: string;
        featureName: string;
    }, any, Operation[], any>, res: Response<FeatureSchema>): Promise<void>;
    archiveFeature(req: IAuthRequest<{
        projectId: string;
        featureName: string;
    }, any, any, any>, res: Response<void>): Promise<void>;
    staleFeatures(req: IAuthRequest<{
        projectId: string;
    }, void, BatchStaleSchema>, res: Response): Promise<void>;
    getFeatureEnvironment(req: Request<FeatureStrategyParams, any, any, any>, res: Response<FeatureEnvironmentSchema>): Promise<void>;
    toggleFeatureEnvironmentOn(req: IAuthRequest<FeatureStrategyParams, any, any, FeatureStrategyQuery>, res: Response<void>): Promise<void>;
    bulkToggleFeaturesEnvironmentOn(req: IAuthRequest<BulkFeaturesStrategyParams, any, BulkToggleFeaturesSchema, FeatureStrategyQuery>, res: Response<void>): Promise<void>;
    bulkToggleFeaturesEnvironmentOff(req: IAuthRequest<BulkFeaturesStrategyParams, any, BulkToggleFeaturesSchema, FeatureStrategyQuery>, res: Response<void>): Promise<void>;
    toggleFeatureEnvironmentOff(req: IAuthRequest<FeatureStrategyParams, any, any, any>, res: Response<void>): Promise<void>;
    addFeatureStrategy(req: IAuthRequest<FeatureStrategyParams, any, CreateFeatureStrategySchema>, res: Response<FeatureStrategySchema>): Promise<void>;
    getFeatureStrategies(req: Request<FeatureStrategyParams, any, any, any>, res: Response<FeatureStrategySchema[]>): Promise<void>;
    setStrategiesSortOrder(req: IAuthRequest<FeatureStrategyParams, any, SetStrategySortOrderSchema, any>, res: Response): Promise<void>;
    updateFeatureStrategy(req: IAuthRequest<StrategyIdParams, any, UpdateFeatureStrategySchema>, res: Response<FeatureStrategySchema>): Promise<void>;
    patchFeatureStrategy(req: IAuthRequest<StrategyIdParams, any, Operation[], any>, res: Response<FeatureStrategySchema>): Promise<void>;
    getFeatureStrategy(req: IAuthRequest<StrategyIdParams, any, any, any>, res: Response<FeatureStrategySchema>): Promise<void>;
    deleteFeatureStrategy(req: IAuthRequest<StrategyIdParams, any, any, any>, res: Response<void>): Promise<void>;
    updateStrategyParameter(req: IAuthRequest<StrategyIdParams, any, {
        name: string;
        value: string | number;
    }, any>, res: Response<FeatureStrategySchema>): Promise<void>;
    updateFeaturesTags(req: IAuthRequest<void, void, TagsBulkAddSchema>, res: Response<TagSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=feature-toggle-controller.d.ts.map