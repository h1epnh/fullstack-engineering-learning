"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFeaturesSchema = void 0;
const client_features_query_schema_1 = require("./client-features-query-schema");
const client_segment_schema_1 = require("./client-segment-schema");
const constraint_schema_1 = require("./constraint-schema");
const environment_schema_1 = require("./environment-schema");
const override_schema_1 = require("./override-schema");
const parameters_schema_1 = require("./parameters-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const client_feature_schema_1 = require("./client-feature-schema");
const variant_schema_1 = require("./variant-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const dependent_feature_schema_1 = require("./dependent-feature-schema");
exports.clientFeaturesSchema = {
    $id: '#/components/schemas/clientFeaturesSchema',
    type: 'object',
    required: ['version', 'features'],
    description: 'Configuration data for server-side SDKs for evaluating feature flags.',
    properties: {
        version: {
            type: 'number',
            description: 'A version number for the format used in the response. Most Unleash instances now return version 2, which includes segments as a separate array',
            example: 2,
            minimum: 0,
        },
        features: {
            description: 'A list of feature flags with their configuration',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientFeatureSchema',
            },
        },
        segments: {
            description: 'A list of [Segments](https://docs.getunleash.io/reference/segments) configured for this Unleash instance',
            type: 'array',
            items: {
                $ref: '#/components/schemas/clientSegmentSchema',
            },
        },
        query: {
            description: 'A summary of filters and parameters sent to the endpoint. Used by the server to build the features and segments response',
            $ref: '#/components/schemas/clientFeaturesQuerySchema',
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            clientFeatureSchema: client_feature_schema_1.clientFeatureSchema,
            environmentSchema: environment_schema_1.environmentSchema,
            clientSegmentSchema: client_segment_schema_1.clientSegmentSchema,
            clientFeaturesQuerySchema: client_features_query_schema_1.clientFeaturesQuerySchema,
            overrideSchema: override_schema_1.overrideSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            variantSchema: variant_schema_1.variantSchema,
            dependentFeatureSchema: dependent_feature_schema_1.dependentFeatureSchema,
        },
    },
};
//# sourceMappingURL=client-features-schema.js.map