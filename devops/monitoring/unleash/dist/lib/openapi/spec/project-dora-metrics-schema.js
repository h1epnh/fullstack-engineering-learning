"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectDoraMetricsSchema = void 0;
const dora_features_schema_1 = require("./dora-features-schema");
exports.projectDoraMetricsSchema = {
    $id: '#/components/schemas/projectDoraMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features'],
    description: 'A projects dora metrics',
    properties: {
        projectAverage: {
            type: 'number',
            description: 'The average time it takes a feature flag to be enabled in production. The measurement unit is days.',
        },
        features: {
            type: 'array',
            items: { $ref: '#/components/schemas/doraFeaturesSchema' },
            description: 'An array of objects containing feature flag name and timeToProduction values. The measurement unit of timeToProduction is days.',
        },
    },
    components: {
        schemas: {
            doraFeaturesSchema: dora_features_schema_1.doraFeaturesSchema,
        },
    },
};
//# sourceMappingURL=project-dora-metrics-schema.js.map