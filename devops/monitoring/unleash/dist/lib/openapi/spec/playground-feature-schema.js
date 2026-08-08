"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundFeatureSchema = exports.unknownFeatureEvaluationResult = void 0;
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const playground_strategy_schema_1 = require("./playground-strategy-schema");
const playground_constraint_schema_1 = require("./playground-constraint-schema");
const playground_segment_schema_1 = require("./playground-segment-schema");
exports.unknownFeatureEvaluationResult = 'unevaluated';
exports.playgroundFeatureSchema = {
    $id: '#/components/schemas/playgroundFeatureSchema',
    description: 'A simplified feature flag model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'projectId',
        'isEnabled',
        'isEnabledInCurrentEnvironment',
        'variant',
        'variants',
        'strategies',
    ],
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
        strategies: {
            type: 'object',
            additionalProperties: false,
            required: ['result', 'data'],
            description: "The feature's applicable strategies and cumulative results of the strategies",
            properties: {
                result: {
                    description: `The cumulative results of all the feature's strategies. Can be \`true\`,
                                  \`false\`, or \`${playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult}\`.
                                  This property will only be \`${playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult}\`
                                  if one or more of the strategies can't be fully evaluated and the rest of the strategies
                                  all resolve to \`false\`.`,
                    anyOf: [
                        { type: 'boolean' },
                        {
                            type: 'string',
                            enum: [playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult],
                        },
                    ],
                },
                data: {
                    description: 'The strategies that apply to this feature.',
                    type: 'array',
                    items: {
                        $ref: playground_strategy_schema_1.playgroundStrategySchema.$id,
                    },
                },
            },
        },
        hasUnsatisfiedDependency: {
            type: 'boolean',
            description: 'Whether the feature has a parent dependency that is not satisfied',
        },
        isEnabledInCurrentEnvironment: {
            type: 'boolean',
            description: 'Whether the feature is active and would be evaluated in the provided environment in a normal SDK context.',
        },
        isEnabled: {
            description: `Whether this feature is enabled or not in the current environment.
                          If a feature can't be fully evaluated (that is, \`strategies.result\` is \`${playground_strategy_schema_1.playgroundStrategyEvaluation.unknownResult}\`),
                          this will be \`false\` to align with how client SDKs treat unresolved feature states.`,
            type: 'boolean',
            example: true,
        },
        variant: {
            description: `The feature variant you receive based on the provided context or the _disabled
                          variant_. If a feature is disabled or doesn't have any
                          variants, you would get the _disabled variant_.
                          Otherwise, you'll get one of thefeature's defined variants.`,
            type: 'object',
            additionalProperties: false,
            required: ['name', 'enabled'],
            properties: {
                name: {
                    type: 'string',
                    description: "The variant's name. If there is no variant or if the flag is disabled, this will be `disabled`",
                    example: 'red-variant',
                },
                enabled: {
                    type: 'boolean',
                    description: "Whether the variant is enabled or not. If the feature is disabled or if it doesn't have variants, this property will be `false`",
                },
                payload: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['type', 'value'],
                    description: 'An optional payload attached to the variant.',
                    properties: {
                        type: {
                            description: 'The format of the payload.',
                            type: 'string',
                        },
                        value: {
                            type: 'string',
                            description: 'The payload value stringified.',
                            example: '{"property": "value"}',
                        },
                    },
                },
                feature_enabled: {
                    type: 'boolean',
                    description: 'Use `featureEnabled` instead.',
                    example: true,
                },
                featureEnabled: {
                    deprecated: true,
                    type: 'boolean',
                    description: 'Whether the feature is enabled or not.',
                    example: true,
                },
            },
            nullable: true,
            example: { name: 'green', enabled: true },
        },
        variants: {
            type: 'array',
            description: 'The feature variants.',
            items: { $ref: variant_schema_1.variantSchema.$id },
        },
    },
    components: {
        schemas: {
            playgroundStrategySchema: playground_strategy_schema_1.playgroundStrategySchema,
            playgroundConstraintSchema: playground_constraint_schema_1.playgroundConstraintSchema,
            playgroundSegmentSchema: playground_segment_schema_1.playgroundSegmentSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
        },
        variants: { type: 'array', items: { $ref: variant_schema_1.variantSchema.$id } },
    },
};
//# sourceMappingURL=playground-feature-schema.js.map