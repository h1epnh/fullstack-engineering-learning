"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundResponseSchema = void 0;
const sdk_context_schema_1 = require("./sdk-context-schema");
const playground_request_schema_1 = require("./playground-request-schema");
const playground_feature_schema_1 = require("./playground-feature-schema");
const constraint_schema_1 = require("./constraint-schema");
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const playground_constraint_schema_1 = require("./playground-constraint-schema");
const playground_segment_schema_1 = require("./playground-segment-schema");
const playground_strategy_schema_1 = require("./playground-strategy-schema");
exports.playgroundResponseSchema = {
    $id: '#/components/schemas/playgroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            description: 'The given input used to evaluate the features.',
            $ref: playground_request_schema_1.playgroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            description: 'The list of features that have been evaluated.',
            items: {
                $ref: playground_feature_schema_1.playgroundFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            playgroundConstraintSchema: playground_constraint_schema_1.playgroundConstraintSchema,
            playgroundFeatureSchema: playground_feature_schema_1.playgroundFeatureSchema,
            playgroundRequestSchema: playground_request_schema_1.playgroundRequestSchema,
            playgroundSegmentSchema: playground_segment_schema_1.playgroundSegmentSchema,
            playgroundStrategySchema: playground_strategy_schema_1.playgroundStrategySchema,
            sdkContextSchema: sdk_context_schema_1.sdkContextSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
    },
};
//# sourceMappingURL=playground-response-schema.js.map