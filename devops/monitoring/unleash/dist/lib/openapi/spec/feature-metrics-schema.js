"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureMetricsSchema = void 0;
const feature_environment_metrics_schema_1 = require("./feature-environment-metrics-schema");
const date_schema_1 = require("./date-schema");
exports.featureMetricsSchema = {
    $id: '#/components/schemas/featureMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'maturity', 'data'],
    description: 'A batch of feature metrics',
    properties: {
        version: {
            description: 'The version of this schema',
            type: 'integer',
            minimum: 1,
        },
        maturity: {
            description: 'The maturity level of this API (alpha, beta, stable, deprecated)',
            type: 'string',
            example: 'stable',
        },
        data: {
            description: 'Metrics gathered per environment',
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentMetricsSchema',
            },
        },
    },
    components: {
        schemas: {
            featureEnvironmentMetricsSchema: feature_environment_metrics_schema_1.featureEnvironmentMetricsSchema,
            dateSchema: date_schema_1.dateSchema,
        },
    },
};
//# sourceMappingURL=feature-metrics-schema.js.map