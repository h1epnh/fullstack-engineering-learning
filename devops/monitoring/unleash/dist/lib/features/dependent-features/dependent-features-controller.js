"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:child`;
const PATH_DEPENDENCIES = `${PATH_FEATURE}/dependencies`;
const PATH_DEPENDENCIES_CHECK = `/:projectId/dependencies`;
const PATH_PARENTS = `${PATH_FEATURE}/parents`;
const PATH_PARENT_VARIANTS = `${PATH}/:parent/parent-variants`;
const PATH_DEPENDENCY = `${PATH_FEATURE}/dependencies/:parent`;
class DependentFeaturesController extends controller_1.default {
    constructor(config, { transactionalDependentFeaturesService, openApiService, }) {
        super(config);
        this.dependentFeaturesService = transactionalDependentFeaturesService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/dependent-features/dependent-features-controller.ts');
        this.route({
            method: 'post',
            path: PATH_DEPENDENCIES,
            handler: this.addFeatureDependency,
            permission: types_1.UPDATE_FEATURE_DEPENDENCY,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Add a feature dependency.',
                    description: 'Add a dependency to a parent feature. Each environment will resolve corresponding dependency independently.',
                    operationId: 'addFeatureDependency',
                    requestBody: (0, openapi_1.createRequestSchema)('createDependentFeatureSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: PATH_DEPENDENCY,
            handler: this.deleteFeatureDependency,
            permission: types_1.UPDATE_FEATURE_DEPENDENCY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Deletes a feature dependency.',
                    description: 'Remove a dependency to a parent feature.',
                    operationId: 'deleteFeatureDependency',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: PATH_DEPENDENCIES,
            handler: this.deleteFeatureDependencies,
            permission: types_1.UPDATE_FEATURE_DEPENDENCY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Deletes feature dependencies.',
                    description: 'Remove dependencies to all parent features.',
                    operationId: 'deleteFeatureDependencies',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: PATH_PARENTS,
            handler: this.getPossibleParentFeatures,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'List parent options.',
                    description: 'List available parents who have no transitive dependencies.',
                    operationId: 'listParentOptions',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('parentFeatureOptionsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: PATH_PARENT_VARIANTS,
            handler: this.getPossibleParentVariants,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'List parent feature variants.',
                    description: 'List available parent variants across all strategy variants and feature environment variants.',
                    operationId: 'listParentVariantOptions',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('parentVariantOptionsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: PATH_DEPENDENCIES_CHECK,
            handler: this.checkDependenciesExist,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Check dependencies exist.',
                    description: 'Check if any dependencies exist in this Unleash instance',
                    operationId: 'checkDependenciesExist',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('dependenciesExistSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
    }
    async addFeatureDependency(req, res) {
        const { child, projectId } = req.params;
        const { variants, enabled, feature } = req.body;
        await this.dependentFeaturesService.transactional((service) => service.upsertFeatureDependency({ child, projectId }, {
            variants,
            enabled,
            feature,
        }, req.user, req.audit));
        res.status(200).end();
    }
    async deleteFeatureDependency(req, res) {
        const { child, parent, projectId } = req.params;
        await this.dependentFeaturesService.transactional((service) => service.deleteFeatureDependency({
            parent,
            child,
        }, projectId, req.user, req.audit));
        res.status(200).end();
    }
    async deleteFeatureDependencies(req, res) {
        const { child, projectId } = req.params;
        await this.dependentFeaturesService.transactional((service) => service.deleteFeaturesDependencies([child], projectId, req.user, req.audit));
        res.status(200).end();
    }
    async getPossibleParentFeatures(req, res) {
        const { child } = req.params;
        const options = await this.dependentFeaturesService.getPossibleParentFeatures(child);
        this.openApiService.respondWithValidation(200, res, openapi_1.parentFeatureOptionsSchema.$id, options);
    }
    async getPossibleParentVariants(req, res) {
        const { parent } = req.params;
        const options = await this.dependentFeaturesService.getPossibleParentVariants(parent);
        this.openApiService.respondWithValidation(200, res, openapi_1.parentVariantOptionsSchema.$id, options);
    }
    async checkDependenciesExist(req, res) {
        const { child } = req.params;
        const exist = await this.dependentFeaturesService.checkDependenciesExist();
        res.send(exist);
    }
}
exports.default = DependentFeaturesController;
//# sourceMappingURL=dependent-features-controller.js.map