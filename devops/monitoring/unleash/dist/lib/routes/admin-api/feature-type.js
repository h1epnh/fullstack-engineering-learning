"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureTypeController = void 0;
const permissions_1 = require("../../types/permissions");
const feature_types_schema_1 = require("../../openapi/spec/feature-types-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const controller_1 = __importDefault(require("../controller"));
const openapi_1 = require("../../openapi");
const version = 1;
class FeatureTypeController extends controller_1.default {
    constructor(config, { featureTypeService, openApiService, }) {
        super(config);
        this.featureTypeService = featureTypeService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/admin-api/feature-type.js');
        this.route({
            method: 'get',
            path: '',
            handler: this.getAllFeatureTypes,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Feature Types'],
                    operationId: 'getAllFeatureTypes',
                    summary: 'Get all feature types',
                    description: 'Retrieves all feature types that exist in this Unleash instance, along with their descriptions and lifetimes.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureTypesSchema'),
                        ...(0, openapi_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:id/lifetime',
            handler: this.updateLifetime,
            permission: permissions_1.ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Feature Types'],
                    operationId: 'updateFeatureTypeLifetime',
                    summary: 'Update feature type lifetime',
                    description: `Updates the lifetime configuration for the specified [feature flag type](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types). The expected lifetime is an integer representing the number of days before Unleash marks a feature flag of that type as potentially stale. If set to \`null\` or \`0\`, then feature flags of that particular type will never be marked as potentially stale.

When a feature flag type's expected lifetime is changed, this will also cause any feature flags of this type to be reevaluated for potential staleness.`,
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureTypeSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 404, 409, 415),
                    },
                    requestBody: (0, openapi_1.createRequestSchema)('updateFeatureTypeLifetimeSchema'),
                }),
            ],
        });
    }
    async getAllFeatureTypes(req, res) {
        this.openApiService.respondWithValidation(200, res, feature_types_schema_1.featureTypesSchema.$id, {
            version,
            types: await this.featureTypeService.getAll(),
        });
    }
    async updateLifetime(req, res) {
        const result = await this.featureTypeService.updateLifetime(req.params.id.toLowerCase(), req.body.lifetimeDays, req.audit);
        this.openApiService.respondWithValidation(200, res, openapi_1.featureTypeSchema.$id, result);
    }
}
exports.FeatureTypeController = FeatureTypeController;
//# sourceMappingURL=feature-type.js.map