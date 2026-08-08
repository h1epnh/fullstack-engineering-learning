import type { IUnleashConfig, IUnleashStores } from '../../types';
import type { IFeatureSearchParams, IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
export declare class FeatureSearchService {
    private featureSearchStore;
    private logger;
    constructor({ featureSearchStore }: Pick<IUnleashStores, 'featureSearchStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>);
    search(params: IFeatureSearchParams): Promise<{
        features: import("../../types").IFeatureSearchOverview[];
        total: number;
    }>;
    convertToQueryParams: (params: IFeatureSearchParams) => IQueryParam[];
}
//# sourceMappingURL=feature-search-service.d.ts.map