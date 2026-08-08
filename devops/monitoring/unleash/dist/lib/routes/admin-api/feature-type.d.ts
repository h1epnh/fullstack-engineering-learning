import type { Request, Response } from 'express';
import type { IUnleashServices } from '../../types/services';
import type { IUnleashConfig } from '../../types/option';
import { type FeatureTypesSchema } from '../../openapi/spec/feature-types-schema';
import Controller from '../controller';
import { type FeatureTypeSchema, type UpdateFeatureTypeLifetimeSchema } from '../../openapi';
import type { IAuthRequest } from '../unleash-types';
export declare class FeatureTypeController extends Controller {
    private featureTypeService;
    private openApiService;
    private logger;
    private flagResolver;
    constructor(config: IUnleashConfig, { featureTypeService, openApiService, }: Pick<IUnleashServices, 'featureTypeService' | 'openApiService'>);
    getAllFeatureTypes(req: Request, res: Response<FeatureTypesSchema>): Promise<void>;
    updateLifetime(req: IAuthRequest<{
        id: string;
    }, unknown, UpdateFeatureTypeLifetimeSchema>, res: Response<FeatureTypeSchema>): Promise<void>;
}
//# sourceMappingURL=feature-type.d.ts.map