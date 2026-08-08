"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const extract_user_1 = require("../../util/extract-user");
const permissions_1 = require("../../types/permissions");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const strategy_schema_1 = require("../../openapi/spec/strategy-schema");
const strategies_schema_1 = require("../../openapi/spec/strategies-schema");
const version = 1;
class StrategyController extends controller_1.default {
    constructor(config, { strategyService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/strategy.js');
        this.strategyService = strategyService;
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getAllStrategies,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all strategies',
                    description: 'Retrieves all strategy types ([predefined](https://docs.getunleash.io/reference/activation-strategies "predefined strategies") and [custom strategies](https://docs.getunleash.io/reference/custom-activation-strategies)) that are defined on this Unleash instance.',
                    tags: ['Strategies'],
                    operationId: 'getAllStrategies',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('strategiesSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getStrategy,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a strategy definition',
                    description: 'Retrieves the definition of the strategy specified in the URL',
                    tags: ['Strategies'],
                    operationId: 'getStrategy',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('strategySchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:name',
            handler: this.removeStrategy,
            permission: permissions_1.DELETE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    summary: 'Delete a strategy',
                    description: 'Deletes the specified strategy definition',
                    tags: ['Strategies'],
                    operationId: 'removeStrategy',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createStrategy,
            permission: permissions_1.CREATE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    deprecated: true,
                    tags: ['Strategies'],
                    operationId: 'createStrategy',
                    summary: 'Create a strategy',
                    description: 'Creates a custom strategy type based on the supplied data. Custom strategies are deprecated and should not be used. Prefer using built in strategies with constraints instead.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createStrategySchema'),
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('strategySchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 409, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:name',
            handler: this.updateStrategy,
            permission: permissions_1.UPDATE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    summary: 'Update a strategy type',
                    description: 'Updates the specified strategy type. Any properties not specified in the request body are left untouched.',
                    operationId: 'updateStrategy',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateStrategySchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:strategyName/deprecate',
            handler: this.deprecateStrategy,
            permission: permissions_1.UPDATE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    summary: 'Deprecate a strategy',
                    description: 'Marks the specified strategy as deprecated.',
                    operationId: 'deprecateStrategy',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:strategyName/reactivate',
            handler: this.reactivateStrategy,
            permission: permissions_1.UPDATE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'reactivateStrategy',
                    summary: 'Reactivate a strategy',
                    description: "Marks the specified strategy as not deprecated. If the strategy wasn't already deprecated, nothing changes.",
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getAllStrategies(req, res) {
        const strategies = await this.strategyService.getStrategies();
        this.openApiService.respondWithValidation(200, res, strategies_schema_1.strategiesSchema.$id, { version, strategies });
    }
    async getStrategy(req, res) {
        const strategy = await this.strategyService.getStrategy(req.params.name);
        this.openApiService.respondWithValidation(200, res, strategy_schema_1.strategySchema.$id, strategy);
    }
    async removeStrategy(req, res) {
        const strategyName = req.params.name;
        const userName = (0, extract_user_1.extractUsername)(req);
        await this.strategyService.removeStrategy(strategyName, req.audit);
        res.status(200).end();
    }
    async createStrategy(req, res) {
        const userName = (0, extract_user_1.extractUsername)(req);
        const strategy = await this.strategyService.createStrategy(req.body, req.audit);
        this.openApiService.respondWithValidation(201, res, strategy_schema_1.strategySchema.$id, strategy, { location: `strategies/${strategy.name}` });
    }
    async updateStrategy(req, res) {
        const userName = (0, extract_user_1.extractUsername)(req);
        await this.strategyService.updateStrategy({ ...req.body, name: req.params.name }, req.audit);
        res.status(200).end();
    }
    async deprecateStrategy(req, res) {
        const userName = (0, extract_user_1.extractUsername)(req);
        const { strategyName } = req.params;
        await this.strategyService.deprecateStrategy(strategyName, req.audit);
        res.status(200).end();
    }
    async reactivateStrategy(req, res) {
        const userName = (0, extract_user_1.extractUsername)(req);
        const { strategyName } = req.params;
        await this.strategyService.reactivateStrategy(strategyName, req.audit);
        res.status(200).end();
    }
}
exports.default = StrategyController;
//# sourceMappingURL=strategy.js.map