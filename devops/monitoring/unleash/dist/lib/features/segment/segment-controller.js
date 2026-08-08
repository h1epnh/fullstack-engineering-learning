"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentsController = void 0;
const controller_1 = __importDefault(require("../../routes/controller"));
const openapi_1 = require("../../openapi");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const types_1 = require("../../types");
const segments_schema_1 = require("../../openapi/spec/segments-schema");
const util_1 = require("../../util");
const error_1 = require("../../error");
class SegmentsController extends controller_1.default {
    constructor(config, { segmentService, accessService, openApiService, }) {
        super(config);
        this.flagResolver = config.flagResolver;
        this.config = config;
        this.logger = config.getLogger('/admin-api/segments.ts');
        this.segmentService = segmentService;
        this.accessService = accessService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Validates if a segment name exists',
                    description: 'Uses the name provided in the body of the request to validate if the given name exists or not',
                    tags: ['Segments'],
                    operationId: 'validateSegment',
                    requestBody: (0, openapi_1.createRequestSchema)('nameSchema'),
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 409, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/strategies/:strategyId',
            handler: this.getSegmentsByStrategy,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getSegmentsByStrategyId',
                    summary: 'Get strategy segments',
                    description: "Retrieve all segments that are referenced by the specified strategy. Returns an empty list of segments if the strategy ID doesn't exist.",
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('segmentsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/strategies',
            handler: this.updateFeatureStrategySegments,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Update strategy segments',
                    description: 'Sets the segments of the strategy specified to be exactly the ones passed in the payload. Any segments that were used by the strategy before will be removed if they are not in the provided list of segments.',
                    tags: ['Strategies'],
                    operationId: 'updateFeatureStrategySegments',
                    requestBody: (0, openapi_1.createRequestSchema)('updateFeatureStrategySegmentsSchema'),
                    responses: {
                        201: (0, openapi_1.resourceCreatedResponseSchema)('updateFeatureStrategySegmentsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:id/strategies',
            handler: this.getStrategiesBySegment,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getStrategiesBySegmentId',
                    summary: 'Get strategies that reference segment',
                    description: 'Retrieve all strategies that reference the specified segment.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('segmentStrategiesSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:id',
            handler: this.removeSegment,
            permission: [types_1.DELETE_SEGMENT, types_1.UPDATE_PROJECT_SEGMENT],
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    summary: 'Deletes a segment by id',
                    description: 'Deletes a segment by its id, if not found returns a 409 error',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    tags: ['Segments'],
                    operationId: 'removeSegment',
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 409),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateSegment,
            permission: [types_1.UPDATE_SEGMENT, types_1.UPDATE_PROJECT_SEGMENT],
            middleware: [
                openApiService.validPath({
                    summary: 'Update segment by id',
                    description: 'Updates the content of the segment with the provided payload. Requires `name` and `constraints` to be present. If `project` is not present, it will be set to `null`. Any other fields not specified will be left untouched.',
                    tags: ['Segments'],
                    operationId: 'updateSegment',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    requestBody: (0, openapi_1.createRequestSchema)('upsertSegmentSchema'),
                    responses: {
                        204: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 409, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:id',
            handler: this.getSegment,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a segment',
                    description: 'Retrieves a segment based on its ID.',
                    tags: ['Segments'],
                    operationId: 'getSegment',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('adminSegmentSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createSegment,
            permission: [types_1.CREATE_SEGMENT, types_1.UPDATE_PROJECT_SEGMENT],
            middleware: [
                openApiService.validPath({
                    summary: 'Create a new segment',
                    description: 'Creates a new segment using the payload provided',
                    tags: ['Segments'],
                    operationId: 'createSegment',
                    requestBody: (0, openapi_1.createRequestSchema)('upsertSegmentSchema'),
                    responses: {
                        201: (0, openapi_1.resourceCreatedResponseSchema)('adminSegmentSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 409, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '',
            handler: this.getSegments,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all segments',
                    description: 'Retrieves all segments that exist in this Unleash instance.',
                    tags: ['Segments'],
                    operationId: 'getSegments',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('segmentsSchema'),
                    },
                }),
            ],
        });
    }
    async validate(req, res) {
        const { name } = req.body;
        await this.segmentService.validateName(name);
        res.status(204).send();
    }
    async getSegmentsByStrategy(req, res) {
        const { strategyId } = req.params;
        const segments = await this.segmentService.getByStrategy(strategyId);
        const responseBody = this.flagResolver.isEnabled('anonymiseEventLog')
            ? {
                segments: (0, util_1.anonymiseKeys)(segments, ['createdBy']),
            }
            : { segments };
        this.openApiService.respondWithValidation(200, res, segments_schema_1.segmentsSchema.$id, (0, types_1.serializeDates)(responseBody));
    }
    async updateFeatureStrategySegments(req, res) {
        const { projectId, environmentId, strategyId, segmentIds } = req.body;
        const hasFeatureStrategyPermission = this.accessService.hasPermission(req.user, types_1.UPDATE_FEATURE_STRATEGY, projectId, environmentId);
        if (!hasFeatureStrategyPermission) {
            res.status(403).send();
            return;
        }
        if (segmentIds.length > this.config.strategySegmentsLimit) {
            throw new error_1.BadDataError(`Strategies may not have more than ${this.config.strategySegmentsLimit} segments`);
        }
        const segments = await this.segmentService.getByStrategy(strategyId);
        const currentSegmentIds = segments.map((segment) => segment.id);
        await this.removeFromStrategy(strategyId, currentSegmentIds.filter((id) => !segmentIds.includes(id)));
        await this.addToStrategy(strategyId, segmentIds.filter((id) => !currentSegmentIds.includes(id)));
        this.openApiService.respondWithValidation(201, res, openapi_1.updateFeatureStrategySchema.$id, req.body, {
            location: `strategies/${strategyId}`,
        });
    }
    async getStrategiesBySegment(req, res) {
        const id = req.params.id;
        const { user } = req;
        const strategies = await this.segmentService.getVisibleStrategies(id, (0, util_1.extractUserIdFromUser)(user));
        const segmentStrategies = strategies.strategies.map((strategy) => ({
            id: strategy.id,
            projectId: strategy.projectId,
            featureName: strategy.featureName,
            strategyName: strategy.strategyName,
            environment: strategy.environment,
        }));
        const changeRequestStrategies = strategies.changeRequestStrategies.map((strategy) => ({
            ...('id' in strategy ? { id: strategy.id } : {}),
            projectId: strategy.projectId,
            featureName: strategy.featureName,
            strategyName: strategy.strategyName,
            environment: strategy.environment,
            changeRequest: strategy.changeRequest,
        }));
        res.json({
            strategies: segmentStrategies,
            changeRequestStrategies,
        });
    }
    async removeSegment(req, res) {
        const id = req.params.id;
        let segmentIsInUse = false;
        segmentIsInUse = await this.segmentService.isInUse(id);
        if (segmentIsInUse) {
            res.status(409).send();
        }
        else {
            await this.segmentService.delete(id, req.user, req.audit);
            res.status(204).send();
        }
    }
    async updateSegment(req, res) {
        const id = req.params.id;
        const updateRequest = {
            name: req.body.name,
            description: req.body.description,
            project: req.body.project,
            constraints: req.body.constraints,
        };
        await this.segmentService.update(id, updateRequest, req.user, req.audit);
        res.status(204).send();
    }
    async getSegment(req, res) {
        const id = req.params.id;
        const segment = await this.segmentService.get(id);
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            res.json((0, util_1.anonymiseKeys)(segment, ['createdBy']));
        }
        else {
            res.json(segment);
        }
    }
    async createSegment(req, res) {
        const createRequest = req.body;
        const segment = await this.segmentService.create(createRequest, req.audit);
        this.openApiService.respondWithValidation(201, res, openapi_1.adminSegmentSchema.$id, (0, types_1.serializeDates)(segment), { location: `segments/${segment.id}` });
    }
    async getSegments(req, res) {
        const segments = await this.segmentService.getAll();
        const response = {
            segments: this.flagResolver.isEnabled('anonymiseEventLog')
                ? (0, util_1.anonymiseKeys)(segments, ['createdBy'])
                : segments,
        };
        this.openApiService.respondWithValidation(200, res, segments_schema_1.segmentsSchema.$id, (0, types_1.serializeDates)(response));
    }
    async removeFromStrategy(strategyId, segmentIds) {
        await Promise.all(segmentIds.map((id) => this.segmentService.removeFromStrategy(id, strategyId)));
    }
    async addToStrategy(strategyId, segmentIds) {
        await Promise.all(segmentIds.map((id) => this.segmentService.addToStrategy(id, strategyId)));
    }
}
exports.SegmentsController = SegmentsController;
//# sourceMappingURL=segment-controller.js.map