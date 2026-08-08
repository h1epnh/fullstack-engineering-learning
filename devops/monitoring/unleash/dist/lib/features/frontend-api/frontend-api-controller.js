"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const index_1 = require("./index");
const middleware_1 = require("../../middleware");
const not_implemented_error_1 = __importDefault(require("../../error/not-implemented-error"));
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const date_fns_1 = require("date-fns");
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
class FrontendAPIController extends controller_1.default {
    constructor(config, services) {
        super(config);
        this.logger = config.getLogger('frontend-api-controller.ts');
        this.services = services;
        this.timer = (functionName) => metrics_helper_1.default.wrapTimer(config.eventBus, metric_events_1.FUNCTION_TIME, {
            className: 'FrontendAPIController',
            functionName,
        });
        // Support CORS requests for the frontend endpoints.
        // Preflight requests are handled in `app.ts`.
        this.app.use((0, middleware_1.corsOriginMiddleware)(services, config));
        this.route({
            method: 'get',
            path: '',
            handler: this.getFrontendApiFeatures,
            permission: types_1.NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    operationId: 'getFrontendFeatures',
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('frontendApiFeaturesSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                    summary: 'Retrieve enabled feature flags for the provided context.',
                    description: 'This endpoint returns the list of feature flags that the frontend API evaluates to enabled for the given context. Context values are provided as query parameters. If the Frontend API is disabled 404 is returned.',
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.getFrontendApiFeatures,
            permission: types_1.NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    operationId: 'getFrontendApiFeaturesWithPost',
                    requestBody: (0, openapi_1.createRequestSchema)('frontendApiFeaturesPostSchema'),
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('frontendApiFeaturesSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                    summary: 'Retrieve enabled feature flags for the provided context, using POST.',
                    description: 'This endpoint returns the list of feature flags that the frontend API evaluates to enabled for the given context, using POST. Context values are provided as a `context` property in the request body. If the Frontend API is disabled 404 is returned.',
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/client/features',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: types_1.NONE,
        });
        this.route({
            method: 'post',
            path: '/client/metrics',
            handler: this.registerFrontendApiMetrics,
            permission: types_1.NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    summary: 'Register client usage metrics',
                    description: `Registers usage metrics. Stores information about how many times each flag was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature flag's variants were displayed to the end user. If the Frontend API is disabled 404 is returned.`,
                    operationId: 'registerFrontendMetrics',
                    requestBody: (0, openapi_1.createRequestSchema)('clientMetricsSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        204: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(400, 401, 404),
                    },
                }),
                (0, express_rate_limit_1.default)({
                    windowMs: (0, date_fns_1.minutesToMilliseconds)(1),
                    max: config.metricsRateLimiting.frontendMetricsMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/client/register',
            handler: this.registerFrontendApiClient,
            permission: types_1.NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    summary: 'Register a client SDK',
                    description: 'This is for future use. Currently Frontend client registration is not supported. Returning 200 for clients that expect this status code. If the Frontend API is disabled 404 is returned.',
                    operationId: 'registerFrontendClient',
                    requestBody: (0, openapi_1.createRequestSchema)('frontendApiClientSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(400, 401, 404),
                    },
                }),
                (0, express_rate_limit_1.default)({
                    windowMs: (0, date_fns_1.minutesToMilliseconds)(1),
                    max: config.metricsRateLimiting
                        .frontendRegisterMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/health',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: types_1.NONE,
        });
        this.route({
            method: 'get',
            path: '/internal-backstage/prometheus',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: types_1.NONE,
        });
    }
    static async endpointNotImplemented(req, res) {
        const error = new not_implemented_error_1.default('The frontend API does not support this endpoint.');
        res.status(error.statusCode).json(error);
    }
    async getFrontendApiFeatures(req, res) {
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new notfound_error_1.default();
        }
        const toggles = await this.services.frontendApiService.getFrontendApiFeatures(req.user, FrontendAPIController.createContext(req));
        res.set('Cache-control', 'no-cache');
        this.services.openApiService.respondWithValidation(200, res, openapi_1.frontendApiFeaturesSchema.$id, { toggles });
    }
    async registerFrontendApiMetrics(req, res) {
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new notfound_error_1.default();
        }
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.sendStatus(204);
            return;
        }
        await this.services.frontendApiService.registerFrontendApiMetrics(req.user, req.body, req.ip);
        res.sendStatus(200);
    }
    async registerFrontendApiClient(req, res) {
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new notfound_error_1.default();
        }
        // Client registration is not yet supported by @unleash/proxy,
        // but proxy clients may still expect a 200 from this endpoint.
        res.sendStatus(200);
    }
    static createContext(req) {
        const { query, body } = req;
        const bodyContext = body.context ?? {};
        const contextData = req.method === 'POST' ? bodyContext : query;
        return (0, index_1.enrichContextWithIp)(contextData, req.ip);
    }
}
exports.default = FrontendAPIController;
//# sourceMappingURL=frontend-api-controller.js.map