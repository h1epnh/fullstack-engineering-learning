"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFeaturesDeltaSchema = void 0;
const constraint_schema_1 = require("./constraint-schema");
const client_feature_schema_1 = require("./client-feature-schema");
const environment_schema_1 = require("./environment-schema");
const client_segment_schema_1 = require("./client-segment-schema");
const override_schema_1 = require("./override-schema");
const parameters_schema_1 = require("./parameters-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const variant_schema_1 = require("./variant-schema");
const dependent_feature_schema_1 = require("./dependent-feature-schema");
exports.clientFeaturesDeltaSchema = {
    $id: '#/components/schemas/clientFeaturesDeltaSchema',
    type: 'object',
    required: ['events'],
    description: 'Schema for delta updates of feature configurations.',
    properties: {
        events: {
            description: 'A list of delta events.',
            type: 'array',
            items: {
                type: 'object',
                anyOf: [
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'feature'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['feature-updated'] },
                            feature: {
                                $ref: '#/components/schemas/clientFeatureSchema',
                            },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'featureName', 'project'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['feature-removed'] },
                            featureName: { type: 'string' },
                            project: { type: 'string' },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'segment'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['segment-updated'] },
                            segment: {
                                $ref: '#/components/schemas/clientSegmentSchema',
                            },
                        },
                    },
                    {
                        type: 'object',
                        required: ['eventId', 'type', 'segmentId'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['segment-removed'] },
                            segmentId: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        required: ['type', 'features', 'segments', 'eventId'],
                        properties: {
                            eventId: { type: 'number' },
                            type: { type: 'string', enum: ['hydration'] },
                            features: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/clientFeatureSchema',
                                },
                            },
                            segments: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/clientSegmentSchema',
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            clientFeatureSchema: client_feature_schema_1.clientFeatureSchema,
            environmentSchema: environment_schema_1.environmentSchema,
            clientSegmentSchema: client_segment_schema_1.clientSegmentSchema,
            overrideSchema: override_schema_1.overrideSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            variantSchema: variant_schema_1.variantSchema,
            dependentFeatureSchema: dependent_feature_schema_1.dependentFeatureSchema,
        },
    },
};
//# sourceMappingURL=client-features-delta-schema.js.map