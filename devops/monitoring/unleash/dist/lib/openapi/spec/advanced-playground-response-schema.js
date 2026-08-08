"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedPlaygroundResponseSchema = void 0;
const sdk_context_schema_1 = require("./sdk-context-schema");
const constraint_schema_1 = require("./constraint-schema");
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const playground_constraint_schema_1 = require("./playground-constraint-schema");
const playground_segment_schema_1 = require("./playground-segment-schema");
const playground_strategy_schema_1 = require("./playground-strategy-schema");
const advanced_playground_request_schema_1 = require("./advanced-playground-request-schema");
const advanced_playground_feature_schema_1 = require("./advanced-playground-feature-schema");
const advanced_playground_environment_feature_schema_1 = require("./advanced-playground-environment-feature-schema");
const sdk_flat_context_schema_1 = require("./sdk-flat-context-schema");
exports.advancedPlaygroundResponseSchema = {
    $id: '#/components/schemas/advancedPlaygroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            description: 'The given input used to evaluate the features.',
            $ref: advanced_playground_request_schema_1.advancedPlaygroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            description: 'The list of features that have been evaluated.',
            items: {
                $ref: advanced_playground_feature_schema_1.advancedPlaygroundFeatureSchema.$id,
            },
        },
        warnings: {
            type: 'object',
            description: 'Warnings that occurred during evaluation.',
            properties: {
                invalidContextProperties: {
                    type: 'array',
                    description: 'A list of top-level context properties that were provided as input that are not valid due to being the wrong type.',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            playgroundConstraintSchema: playground_constraint_schema_1.playgroundConstraintSchema,
            advancedPlaygroundFeatureSchema: advanced_playground_feature_schema_1.advancedPlaygroundFeatureSchema,
            advancedPlaygroundEnvironmentFeatureSchema: advanced_playground_environment_feature_schema_1.advancedPlaygroundEnvironmentFeatureSchema,
            advancedPlaygroundRequestSchema: advanced_playground_request_schema_1.advancedPlaygroundRequestSchema,
            playgroundSegmentSchema: playground_segment_schema_1.playgroundSegmentSchema,
            playgroundStrategySchema: playground_strategy_schema_1.playgroundStrategySchema,
            sdkContextSchema: sdk_context_schema_1.sdkContextSchema,
            sdkFlatContextSchema: sdk_flat_context_schema_1.sdkFlatContextSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
    },
};
//# sourceMappingURL=advanced-playground-response-schema.js.map