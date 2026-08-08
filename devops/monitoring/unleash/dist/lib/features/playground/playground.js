"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../types/permissions");
const controller_1 = __importDefault(require("../../routes/controller"));
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const playground_response_schema_1 = require("../../openapi/spec/playground-response-schema");
const playground_view_model_1 = require("./playground-view-model");
const util_1 = require("../../util");
class PlaygroundController extends controller_1.default {
    constructor(config, { openApiService, playgroundService, }) {
        super(config);
        this.openApiService = openApiService;
        this.playgroundService = playgroundService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'post',
            path: '',
            handler: this.evaluateContext,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getPlayground',
                    tags: ['Playground'],
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(400, 401),
                        200: (0, create_response_schema_1.createResponseSchema)('playgroundResponseSchema'),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('playgroundRequestSchema'),
                    description: 'Deprecated. Will be removed in the next Unleash major update. Use the provided `context`, `environment`, and `projects` to evaluate toggles on this Unleash instance. Returns a list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary: 'Evaluate an Unleash context against a set of environments and projects.',
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/advanced',
            handler: this.evaluateAdvancedContext,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getAdvancedPlayground',
                    tags: ['Playground'],
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(400, 401),
                        200: (0, create_response_schema_1.createResponseSchema)('advancedPlaygroundResponseSchema'),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('advancedPlaygroundRequestSchema'),
                    description: 'Use the provided `context`, `environments`, and `projects` to evaluate toggles on this Unleash instance. You can use comma-separated values to provide multiple values to each context field. Returns a combinatorial list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary: 'Batch evaluate an Unleash context against a set of environments and projects.',
                }),
            ],
        });
    }
    async evaluateContext(req, res) {
        const result = await this.playgroundService.evaluateQuery(req.body.projects || '*', req.body.environment, req.body.context);
        const response = (0, playground_view_model_1.playgroundViewModel)(req.body, result);
        this.openApiService.respondWithValidation(200, res, playground_response_schema_1.playgroundResponseSchema.$id, response);
    }
    async evaluateAdvancedContext(req, res) {
        const { user } = req;
        const { result, invalidContextProperties } = await this.playgroundService.evaluateAdvancedQuery(req.body.projects || '*', req.body.environments, req.body.context, (0, util_1.extractUserIdFromUser)(user));
        const response = (0, playground_view_model_1.advancedPlaygroundViewModel)(req.body, result, invalidContextProperties);
        res.json(response);
    }
}
exports.default = PlaygroundController;
//# sourceMappingURL=playground.js.map