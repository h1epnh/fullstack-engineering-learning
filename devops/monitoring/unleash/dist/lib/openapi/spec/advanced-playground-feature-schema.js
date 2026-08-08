"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedPlaygroundFeatureSchema = void 0;
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const playground_strategy_schema_1 = require("./playground-strategy-schema");
const playground_constraint_schema_1 = require("./playground-constraint-schema");
const playground_segment_schema_1 = require("./playground-segment-schema");
const sdk_context_schema_1 = require("./sdk-context-schema");
const advanced_playground_environment_feature_schema_1 = require("./advanced-playground-environment-feature-schema");
const sdk_flat_context_schema_1 = require("./sdk-flat-context-schema");
exports.advancedPlaygroundFeatureSchema = {
    $id: '#/components/schemas/advancedPlaygroundFeatureSchema',
    description: 'A simplified feature flag model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'projectId', 'environments'],
    properties: {
        name: {
            type: 'string',
            example: 'my-feature',
            description: "The feature's name.",
        },
        projectId: {
            type: 'string',
            example: 'my-project',
            description: 'The ID of the project that contains this feature.',
        },
        environments: {
            type: 'object',
            description: 'The lists of features that have been evaluated grouped by environment.',
            additionalProperties: {
                type: 'array',
                items: { $ref: advanced_playground_environment_feature_schema_1.advancedPlaygroundEnvironmentFeatureSchema.$id },
            },
        },
    },
    components: {
        schemas: {
            advancedPlaygroundEnvironmentFeatureSchema: advanced_playground_environment_feature_schema_1.advancedPlaygroundEnvironmentFeatureSchema,
            playgroundStrategySchema: playground_strategy_schema_1.playgroundStrategySchema,
            playgroundConstraintSchema: playground_constraint_schema_1.playgroundConstraintSchema,
            playgroundSegmentSchema: playground_segment_schema_1.playgroundSegmentSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
            sdkContextSchema: sdk_context_schema_1.sdkContextSchema,
            sdkFlatContextSchema: sdk_flat_context_schema_1.sdkFlatContextSchema,
        },
    },
};
//# sourceMappingURL=advanced-playground-feature-schema.js.map