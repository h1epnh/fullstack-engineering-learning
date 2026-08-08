"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const permissions_1 = require("../../../types/permissions");
const standard_responses_1 = require("../../../openapi/util/standard-responses");
const openapi_1 = require("../../../openapi");
const controller_1 = __importDefault(require("../../controller"));
const PATH = '/:projectId';
const PATH_ARCHIVE = `${PATH}/archive`;
const PATH_VALIDATE_ARCHIVE = `${PATH}/archive/validate`;
const PATH_DELETE = `${PATH}/delete`;
const PATH_REVIVE = `${PATH}/revive`;
class ProjectArchiveController extends controller_1.default {
    constructor(config, { transactionalFeatureToggleService, featureToggleService, openApiService, }, startTransaction) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;
        this.startTransaction = startTransaction;
        this.route({
            method: 'post',
            path: PATH_DELETE,
            acceptAnyContentType: true,
            handler: this.deleteFeatures,
            permission: permissions_1.DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'deleteFeatures',
                    description: 'This endpoint deletes the specified features, that are in archive.',
                    summary: 'Deletes a list of features',
                    requestBody: (0, openapi_1.createRequestSchema)('batchFeaturesSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: PATH_REVIVE,
            acceptAnyContentType: true,
            handler: this.reviveFeatures,
            permission: types_1.UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'reviveFeatures',
                    description: 'This endpoint revives the specified features.',
                    summary: 'Revives a list of features',
                    requestBody: (0, openapi_1.createRequestSchema)('batchFeaturesSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: PATH_VALIDATE_ARCHIVE,
            handler: this.validateArchiveFeatures,
            permission: permissions_1.DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateArchiveFeatures',
                    description: 'This endpoint return info about the archive features impact.',
                    summary: 'Validates archive features',
                    requestBody: (0, openapi_1.createRequestSchema)('batchFeaturesSchema'),
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('validateArchiveFeaturesSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: PATH_ARCHIVE,
            handler: this.archiveFeatures,
            permission: permissions_1.DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'archiveFeatures',
                    description: "This endpoint archives the specified features. Any features that are already archived or that don't exist are ignored. All existing features (whether already archived or not) that are provided must belong to the specified project.",
                    summary: 'Archives a list of features',
                    requestBody: (0, openapi_1.createRequestSchema)('batchFeaturesSchema'),
                    responses: {
                        202: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }
    async deleteFeatures(req, res) {
        const { projectId } = req.params;
        const { features } = req.body;
        await this.featureService.deleteFeatures(features, projectId, req.audit);
        res.status(200).end();
    }
    async reviveFeatures(req, res) {
        const { projectId } = req.params;
        const { features } = req.body;
        await this.startTransaction(async (tx) => this.transactionalFeatureToggleService(tx).reviveFeatures(features, projectId, req.audit));
        res.status(200).end();
    }
    async archiveFeatures(req, res) {
        const { features } = req.body;
        const { projectId } = req.params;
        await this.startTransaction(async (tx) => this.transactionalFeatureToggleService(tx).archiveToggles(features, req.user, req.audit, projectId));
        res.status(202).end();
    }
    async validateArchiveFeatures(req, res) {
        const { features } = req.body;
        const { parentsWithChildFeatures, hasDeletedDependencies } = await this.featureService.validateArchiveToggles(features);
        res.send({ parentsWithChildFeatures, hasDeletedDependencies });
    }
}
exports.default = ProjectArchiveController;
module.exports = ProjectArchiveController;
//# sourceMappingURL=project-archive.js.map