"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../../routes/controller"));
const permissions_1 = require("../../../types/permissions");
const create_response_schema_1 = require("../../../openapi/util/create-response-schema");
const serialize_dates_1 = require("../../../types/serialize-dates");
const feature_usage_schema_1 = require("../../../openapi/spec/feature-usage-schema");
const feature_metrics_schema_1 = require("../../../openapi/spec/feature-metrics-schema");
const openapi_1 = require("../../../openapi");
class ClientMetricsController extends controller_1.default {
    constructor(config, { clientMetricsServiceV2, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/client-metrics.ts');
        this.metrics = clientMetricsServiceV2;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: '/features/:name/raw',
            handler: this.getRawToggleMetrics,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getRawFeatureMetrics',
                    tags: ['Metrics'],
                    summary: 'Get feature metrics',
                    description: 'Get usage metrics for a specific feature for the last 48 hours, grouped by hour',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureMetricsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/features/:name',
            handler: this.getToggleMetricsSummary,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getFeatureUsageSummary',
                    tags: ['Metrics'],
                    summary: `Last hour of usage and a list of applications that have reported seeing this feature flag`,
                    description: 'Separate counts for yes (enabled), no (disabled), as well as how many times each variant was selected during the last hour',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureUsageSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async getRawToggleMetrics(req, res) {
        const { name } = req.params;
        const { hoursBack } = req.query;
        const data = await this.metrics.getClientMetricsForToggle(name, this.parseHoursBackQueryParam(hoursBack));
        this.openApiService.respondWithValidation(200, res, feature_metrics_schema_1.featureMetricsSchema.$id, { version: 1, maturity: 'stable', data: (0, serialize_dates_1.serializeDates)(data) });
    }
    async getToggleMetricsSummary(req, res) {
        const { name } = req.params;
        const data = await this.metrics.getFeatureToggleMetricsSummary(name);
        this.openApiService.respondWithValidation(200, res, feature_usage_schema_1.featureUsageSchema.$id, { version: 1, maturity: 'stable', ...(0, serialize_dates_1.serializeDates)(data) });
    }
    parseHoursBackQueryParam(param) {
        if (typeof param !== 'string') {
            return undefined;
        }
        const parsed = Number(param);
        const max = this.flagResolver.isEnabled('extendedUsageMetrics')
            ? ClientMetricsController.HOURS_BACK_MAX_V2
            : ClientMetricsController.HOURS_BACK_MAX;
        if (parsed >= ClientMetricsController.HOURS_BACK_MIN && parsed <= max) {
            return parsed;
        }
    }
}
ClientMetricsController.HOURS_BACK_MIN = 1;
ClientMetricsController.HOURS_BACK_MAX = 48;
ClientMetricsController.HOURS_BACK_MAX_V2 = 24 * 91; // 91 days
exports.default = ClientMetricsController;
//# sourceMappingURL=client-metrics.js.map