"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureSearchService = void 0;
const search_utils_1 = require("./search-utils");
class FeatureSearchService {
    constructor({ featureSearchStore }, { getLogger }) {
        this.convertToQueryParams = (params) => {
            const queryParams = [];
            if (params.state) {
                const parsedState = (0, search_utils_1.parseSearchOperatorValue)('stale', params.state);
                if (parsedState) {
                    queryParams.push(parsedState);
                }
            }
            if (params.createdAt) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('features.created_at', params.createdAt);
                if (parsed)
                    queryParams.push(parsed);
            }
            if (params.createdBy) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('users.id', params.createdBy);
                if (parsed)
                    queryParams.push(parsed);
            }
            if (params.type) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('features.type', params.type);
                if (parsed)
                    queryParams.push(parsed);
            }
            ['tag', 'segment', 'project'].forEach((field) => {
                if (params[field]) {
                    const parsed = (0, search_utils_1.parseSearchOperatorValue)(field, params[field]);
                    if (parsed)
                        queryParams.push(parsed);
                }
            });
            return queryParams;
        };
        this.featureSearchStore = featureSearchStore;
        this.logger = getLogger('services/feature-search-service.ts');
    }
    async search(params) {
        const queryParams = this.convertToQueryParams(params);
        const { features, total } = await this.featureSearchStore.searchFeatures({
            ...params,
            limit: params.limit,
            sortBy: params.sortBy || 'createdAt',
        }, queryParams);
        return {
            features,
            total,
        };
    }
}
exports.FeatureSearchService = FeatureSearchService;
//# sourceMappingURL=feature-search-service.js.map