"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const feature_search_query_parameters_1 = require("../../openapi/spec/feature-search-query-parameters");
const search_utils_1 = require("./search-utils");
const util_1 = require("../../util");
class FeatureSearchController extends controller_1.default {
    constructor(config, { openApiService, featureSearchService }) {
        super(config);
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.featureSearchService = featureSearchService;
        this.logger = config.getLogger('/feature-search/feature-search-controller.ts');
        this.route({
            method: 'get',
            path: '',
            handler: this.searchFeatures,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Search'],
                    summary: 'Search and filter features',
                    description: 'Search and filter by selected fields.',
                    operationId: 'searchFeatures',
                    // top level array needs to be mutable according to openapi library
                    parameters: [...feature_search_query_parameters_1.featureSearchQueryParameters],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('searchFeaturesSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    maybeAnonymise(features) {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return features.map((feature) => ({
                ...feature,
                createdBy: {
                    ...feature.createdBy,
                    name: (0, util_1.anonymise)(feature.createdBy.name),
                },
            }));
        }
        return features;
    }
    async searchFeatures(req, res) {
        const { query, project, type, tag, segment, createdAt, createdBy, state, status, favoritesFirst, archived, sortBy, } = req.query;
        const userId = req.user.id;
        const { normalizedQuery, normalizedSortOrder, normalizedOffset, normalizedLimit, } = (0, search_utils_1.normalizeQueryParams)({
            query,
            offset: req.query.offset,
            limit: req.query.limit,
            sortOrder: req.query.sortOrder,
        }, {
            limitDefault: 50,
            maxLimit: 100,
        });
        const normalizedStatus = status
            ?.map((tag) => tag.split(':'))
            .filter((tag) => tag.length === 2 &&
            ['enabled', 'disabled'].includes(tag[1]));
        const normalizedFavoritesFirst = favoritesFirst === 'true';
        const normalizedArchived = archived === 'IS:true';
        const { features, total } = await this.featureSearchService.search({
            searchParams: normalizedQuery,
            project,
            type,
            userId,
            tag,
            segment,
            state,
            createdAt,
            createdBy,
            sortBy,
            status: normalizedStatus,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortOrder: normalizedSortOrder,
            favoritesFirst: normalizedFavoritesFirst,
            archived: normalizedArchived,
        });
        this.openApiService.respondWithValidation(200, res, openapi_1.searchFeaturesSchema.$id, (0, types_1.serializeDates)({
            features: this.maybeAnonymise(features),
            total,
        }));
    }
}
exports.default = FeatureSearchController;
//# sourceMappingURL=feature-search-controller.js.map