import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IFeatureSearchOverview, type IUnleashConfig, type IUnleashServices } from '../../types';
import { type SearchFeaturesSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type FeatureSearchQueryParameters } from '../../openapi/spec/feature-search-query-parameters';
type FeatureSearchServices = Pick<IUnleashServices, 'openApiService' | 'featureSearchService'>;
export default class FeatureSearchController extends Controller {
    private openApiService;
    private flagResolver;
    private featureSearchService;
    private readonly logger;
    constructor(config: IUnleashConfig, { openApiService, featureSearchService }: FeatureSearchServices);
    maybeAnonymise(features: IFeatureSearchOverview[]): IFeatureSearchOverview[];
    searchFeatures(req: IAuthRequest<any, any, any, FeatureSearchQueryParameters>, res: Response<SearchFeaturesSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=feature-search-controller.d.ts.map