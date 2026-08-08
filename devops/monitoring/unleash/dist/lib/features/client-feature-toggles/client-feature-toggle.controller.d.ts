import type { Response } from 'express';
import Controller from '../../routes/controller';
import type { IUnleashConfig, IUnleashServices } from '../../types';
import type { IFeatureToggleQuery } from '../../types/model';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { ClientFeaturesQuerySchema } from '../../openapi/spec/client-features-query-schema';
import { type ClientFeatureSchema } from '../../openapi/spec/client-feature-schema';
import { type ClientFeaturesSchema } from '../../openapi/spec/client-features-schema';
export interface QueryOverride {
    project?: string[];
    environment?: string;
}
interface IMeta {
    revisionId: number;
    etag: string;
    queryHash: string;
}
export default class FeatureController extends Controller {
    private readonly logger;
    private clientFeatureToggleService;
    private clientSpecService;
    private openApiService;
    private configurationRevisionService;
    private featureToggleService;
    private flagResolver;
    private eventBus;
    private clientFeaturesCacheMap;
    private featuresAndSegments;
    constructor({ clientFeatureToggleService, clientSpecService, openApiService, configurationRevisionService, featureToggleService, }: Pick<IUnleashServices, 'clientFeatureToggleService' | 'clientSpecService' | 'openApiService' | 'configurationRevisionService' | 'featureToggleService'>, config: IUnleashConfig);
    private resolveFeaturesAndSegments;
    private resolveQuery;
    private paramToArray;
    private prepQuery;
    getAll(req: IAuthRequest, res: Response<ClientFeaturesSchema>): Promise<void>;
    calculateMeta(query: IFeatureToggleQuery): Promise<IMeta>;
    getFeatureToggle(req: IAuthRequest<{
        featureName: string;
    }, ClientFeaturesQuerySchema>, res: Response<ClientFeatureSchema>): Promise<void>;
    storeFootprint(): void;
    getCacheSizeInBytes(value: any): number;
    deepEqualIgnoreOrder: (obj1: any, obj2: any) => any;
}
export {};
//# sourceMappingURL=client-feature-toggle.controller.d.ts.map