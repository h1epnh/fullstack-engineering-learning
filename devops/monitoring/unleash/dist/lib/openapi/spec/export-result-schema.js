"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportResultSchema = void 0;
const feature_schema_1 = require("./feature-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const feature_environment_schema_1 = require("./feature-environment-schema");
const context_field_schema_1 = require("./context-field-schema");
const feature_tag_schema_1 = require("./feature-tag-schema");
const parameters_schema_1 = require("./parameters-schema");
const legal_value_schema_1 = require("./legal-value-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const variants_schema_1 = require("./variants-schema");
const constraint_schema_1 = require("./constraint-schema");
const tag_type_schema_1 = require("./tag-type-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const feature_dependencies_schema_1 = require("./feature-dependencies-schema");
const dependent_feature_schema_1 = require("./dependent-feature-schema");
const tag_schema_1 = require("./tag-schema");
exports.exportResultSchema = {
    $id: '#/components/schemas/exportResultSchema',
    type: 'object',
    additionalProperties: false,
    description: 'The result of the export operation, providing you with the feature flag definitions, strategy definitions and the rest of the elements relevant to the features (tags, environments etc.)',
    required: ['features', 'featureStrategies', 'tagTypes'],
    properties: {
        features: {
            type: 'array',
            description: 'All the exported features.',
            example: [
                {
                    name: 'my-feature',
                    description: 'best feature ever',
                    type: 'release',
                    project: 'default',
                    stale: false,
                    impressionData: false,
                    archived: false,
                },
            ],
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
        featureStrategies: {
            type: 'array',
            description: 'All strategy instances that are used by the exported features in the `features` list.',
            example: [
                {
                    name: 'flexibleRollout',
                    id: '924974d7-8003-43ee-87eb-c5f887c06fd1',
                    featureName: 'my-feature',
                    title: 'Rollout 50%',
                    parameters: {
                        groupId: 'default',
                        rollout: '50',
                        stickiness: 'random',
                    },
                    constraints: [],
                    disabled: false,
                    segments: [1],
                },
            ],
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
        },
        featureEnvironments: {
            type: 'array',
            description: 'Environment-specific configuration for all the features in the `features` list. Includes data such as whether the feature is enabled in the selected export environment, whether there are any variants assigned, etc.',
            example: [
                {
                    enabled: true,
                    featureName: 'my-feature',
                    environment: 'development',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            overrides: [],
                            stickiness: 'random',
                            weightType: 'variable',
                        },
                        {
                            name: 'b',
                            weight: 500,
                            overrides: [],
                            stickiness: 'random',
                            weightType: 'variable',
                        },
                    ],
                    name: 'variant-testing',
                },
            ],
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
        },
        contextFields: {
            type: 'array',
            description: 'A list of all the context fields that are in use by any of the strategies in the `featureStrategies` list.',
            example: [
                {
                    name: 'appName',
                    description: 'Allows you to constrain on application name',
                    stickiness: false,
                    sortOrder: 2,
                    legalValues: [],
                },
            ],
            items: {
                $ref: '#/components/schemas/contextFieldSchema',
            },
        },
        featureTags: {
            type: 'array',
            description: 'A list of all the tags that have been applied to any of the features in the `features` list.',
            example: [
                {
                    featureName: 'my-feature',
                    tagType: 'simple',
                    tagValue: 'user-facing',
                },
            ],
            items: {
                $ref: '#/components/schemas/featureTagSchema',
            },
        },
        segments: {
            type: 'array',
            description: 'A list of all the segments that are used by the strategies in the `featureStrategies` list.',
            example: [
                {
                    id: 1,
                    name: 'new-segment-name',
                },
            ],
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'name'],
                properties: {
                    id: {
                        type: 'number',
                    },
                    name: {
                        type: 'string',
                    },
                },
            },
        },
        tagTypes: {
            type: 'array',
            description: 'A list of all of the tag types that are used in the `featureTags` list.',
            example: [
                {
                    name: 'simple',
                    description: 'Used to simplify filtering of features',
                    icon: '#',
                },
            ],
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        dependencies: {
            type: 'array',
            description: 'A list of all the dependencies for features in `features` list.',
            items: {
                $ref: '#/components/schemas/featureDependenciesSchema',
            },
        },
    },
    components: {
        schemas: {
            featureSchema: feature_schema_1.featureSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            featureEnvironmentSchema: feature_environment_schema_1.featureEnvironmentSchema,
            contextFieldSchema: context_field_schema_1.contextFieldSchema,
            featureTagSchema: feature_tag_schema_1.featureTagSchema,
            variantsSchema: variants_schema_1.variantsSchema,
            variantSchema: variant_schema_1.variantSchema,
            overrideSchema: override_schema_1.overrideSchema,
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            legalValueSchema: legal_value_schema_1.legalValueSchema,
            tagTypeSchema: tag_type_schema_1.tagTypeSchema,
            featureDependenciesSchema: feature_dependencies_schema_1.featureDependenciesSchema,
            dependentFeatureSchema: dependent_feature_schema_1.dependentFeatureSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=export-result-schema.js.map