"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const controller_1 = __importDefault(require("../../routes/controller"));
const PATH = '/:projectId/features/:featureName/lifecycle';
class FeatureLifecycleController extends controller_1.default {
    constructor(config, { transactionalFeatureLifecycleService, openApiService, }) {
        super(config);
        this.featureLifecycleService = transactionalFeatureLifecycleService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: PATH,
            handler: this.getFeatureLifecycle,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get feature lifecycle',
                    description: 'Information about the lifecycle stages of the feature.',
                    operationId: 'getFeatureLifecycle',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('featureLifecycleSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: `${PATH}/complete`,
            handler: this.complete,
            permission: types_1.UPDATE_FEATURE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Set feature completed',
                    description: 'This will set the feature as completed.',
                    operationId: 'complete',
                    requestBody: (0, openapi_1.createRequestSchema)('featureLifecycleCompletedSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: `${PATH}/uncomplete`,
            handler: this.uncomplete,
            permission: types_1.UPDATE_FEATURE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Set feature uncompleted',
                    description: 'This will set the feature as uncompleted.',
                    operationId: 'uncomplete',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getFeatureLifecycle(req, res) {
        const { featureName } = req.params;
        const result = await this.featureLifecycleService.getFeatureLifecycle(featureName);
        this.openApiService.respondWithValidation(200, res, openapi_1.featureLifecycleSchema.$id, (0, types_1.serializeDates)(result));
    }
    async complete(req, res) {
        const { featureName, projectId } = req.params;
        const status = req.body;
        await this.featureLifecycleService.transactional((service) => service.featureCompleted(featureName, projectId, status, req.audit));
        res.status(200).end();
    }
    async uncomplete(req, res) {
        const { featureName, projectId } = req.params;
        await this.featureLifecycleService.transactional((service) => service.featureUncompleted(featureName, projectId, req.audit));
        res.status(200).end();
    }
}
exports.default = FeatureLifecycleController;
//# sourceMappingURL=feature-lifecycle-controller.js.map