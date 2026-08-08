"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../../routes/controller"));
const types_1 = require("../../../types");
const permissions_1 = require("../../../types/permissions");
const create_request_schema_1 = require("../../../openapi/util/create-request-schema");
const standard_responses_1 = require("../../../openapi/util/standard-responses");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const date_fns_1 = require("date-fns");
const schema_1 = require("../shared/schema");
class ClientMetricsController extends controller_1.default {
    constructor({ clientInstanceService, clientMetricsServiceV2, openApiService, }, config) {
        super(config);
        const { getLogger } = config;
        this.logger = getLogger('/api/client/metrics');
        this.clientInstanceService = clientInstanceService;
        this.openApiService = openApiService;
        this.metricsV2 = clientMetricsServiceV2;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'post',
            path: '',
            handler: this.registerMetrics,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Client'],
                    summary: 'Register client usage metrics',
                    description: `Registers usage metrics. Stores information about how many times each flag was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature flag's variants were displayed to the end user.`,
                    operationId: 'registerClientMetrics',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('clientMetricsSchema'),
                    responses: {
                        ...(0, standard_responses_1.getStandardResponses)(400),
                        202: standard_responses_1.emptyResponse,
                        204: standard_responses_1.emptyResponse,
                    },
                }),
                (0, express_rate_limit_1.default)({
                    windowMs: (0, date_fns_1.minutesToMilliseconds)(1),
                    max: config.metricsRateLimiting.clientMetricsMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/bulk',
            handler: this.bulkMetrics,
            permission: permissions_1.NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    summary: 'Send metrics in bulk',
                    description: `This operation accepts batched metrics from any client. Metrics will be inserted into Unleash's metrics storage`,
                    operationId: 'clientBulkMetrics',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('bulkMetricsSchema'),
                    responses: {
                        202: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 413, 415),
                    },
                }),
            ],
        });
    }
    async registerMetrics(req, res) {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.status(204).end();
        }
        else {
            try {
                const { body: data, ip: clientIp, user } = req;
                data.environment = this.metricsV2.resolveMetricsEnvironment(user, data);
                await this.clientInstanceService.registerInstance(data, clientIp);
                await this.metricsV2.registerClientMetrics(data, clientIp);
                res.getHeaderNames().forEach((header) => res.removeHeader(header));
                res.status(202).end();
            }
            catch (e) {
                res.status(400).end();
            }
        }
    }
    async bulkMetrics(req, res) {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.status(204).end();
        }
        else {
            const { body, ip: clientIp } = req;
            const { metrics, applications } = body;
            try {
                const promises = [];
                for (const app of applications) {
                    promises.push(this.clientInstanceService.registerClient(app, clientIp));
                }
                if (metrics && metrics.length > 0) {
                    const data = await schema_1.clientMetricsEnvBulkSchema.validateAsync(metrics);
                    const { user } = req;
                    const acceptedEnvironment = this.metricsV2.resolveUserEnvironment(user);
                    const filteredData = data.filter((metric) => metric.environment === acceptedEnvironment);
                    promises.push(this.metricsV2.registerBulkMetrics(filteredData));
                    this.config.eventBus.emit(types_1.CLIENT_METRICS, data);
                }
                await Promise.all(promises);
                res.status(202).end();
            }
            catch (e) {
                res.status(400).end();
            }
        }
    }
}
exports.default = ClientMetricsController;
//# sourceMappingURL=metrics.js.map