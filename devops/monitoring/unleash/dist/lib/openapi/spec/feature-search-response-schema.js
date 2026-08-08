"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureSearchResponseSchema = void 0;
const variant_schema_1 = require("./variant-schema");
const constraint_schema_1 = require("./constraint-schema");
const override_schema_1 = require("./override-schema");
const parameters_schema_1 = require("./parameters-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const tag_schema_1 = require("./tag-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const feature_search_environment_schema_1 = require("./feature-search-environment-schema");
exports.featureSearchResponseSchema = {
    $id: '#/components/schemas/featureSearchResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'description',
        'dependencyType',
        'type',
        'project',
        'stale',
        'favorite',
        'impressionData',
        'createdAt',
        'createdBy',
        'environments',
        'segments',
        'archivedAt',
    ],
    description: 'A feature flag definition',
    properties: {
        name: {
            type: 'string',
            example: 'disable-comments',
            description: 'Unique feature name',
        },
        type: {
            type: 'string',
            example: 'kill-switch',
            description: 'Type of the flag e.g. experiment, kill-switch, release, operational, permission',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'Controls disabling of the comments section in case of an incident',
            description: 'Detailed description of the feature',
        },
        dependencyType: {
            type: 'string',
            enum: ['parent', 'child', null],
            nullable: true,
            example: 'parent',
            description: "The type of dependency. 'parent' means that the feature is a parent feature, 'child' means that the feature is a child feature.",
        },
        project: {
            type: 'string',
            example: 'dx-squad',
            description: 'Name of the project the feature belongs to',
        },
        stale: {
            type: 'boolean',
            example: false,
            description: '`true` if the feature is stale based on the age and feature type, otherwise `false`.',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description: '`true` if the feature was favorited, otherwise `false`.',
        },
        impressionData: {
            type: 'boolean',
            example: false,
            description: '`true` if the impression data collection is enabled for the feature, otherwise `false`.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T15:21:39.975Z',
            description: 'The date the feature was created',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-29T15:21:39.975Z',
            description: 'The date the feature was archived',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            deprecated: true,
            example: '2023-01-28T16:21:39.975Z',
            description: 'The date when metrics where last collected for the feature. This field was deprecated in v5 and will be removed in a future release, use the one in featureEnvironmentSchema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSearchEnvironmentSchema',
            },
            description: 'The list of environments where the feature can be used',
        },
        segments: {
            type: 'array',
            description: 'The list of segments the feature is enabled for.',
            example: ['pro-users', 'main-segment'],
            items: {
                type: 'string',
            },
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'The list of feature variants. This field was deprecated in v5',
            deprecated: true,
        },
        strategies: {
            type: 'array',
            items: {
                type: 'object',
            },
            description: 'This is a legacy field that was deprecated in v5',
            deprecated: true,
        },
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
            nullable: true,
            description: 'The list of feature tags',
        },
        lifecycle: {
            type: 'object',
            description: 'Current lifecycle stage of the feature',
            additionalProperties: false,
            required: ['stage', 'enteredStageAt'],
            properties: {
                stage: {
                    description: 'The name of the current lifecycle stage',
                    type: 'string',
                    enum: [
                        'initial',
                        'pre-live',
                        'live',
                        'completed',
                        'archived',
                    ],
                    example: 'initial',
                },
                status: {
                    type: 'string',
                    nullable: true,
                    example: 'kept',
                    description: 'The name of the detailed status of a given stage. E.g. completed stage can be kept or discarded.',
                },
                enteredStageAt: {
                    description: 'When the feature entered this stage',
                    type: 'string',
                    format: 'date-time',
                    example: '2023-01-28T15:21:39.975Z',
                },
            },
        },
        createdBy: {
            type: 'object',
            description: 'User who created the feature flag',
            additionalProperties: false,
            required: ['id', 'name', 'imageUrl'],
            properties: {
                id: {
                    description: 'The user id',
                    type: 'integer',
                    example: 123,
                },
                name: {
                    description: 'Name of the user',
                    type: 'string',
                    example: 'User',
                },
                imageUrl: {
                    description: `URL used for the user profile image`,
                    type: 'string',
                    example: 'https://example.com/242x200.png',
                },
            },
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            featureSearchEnvironmentSchema: feature_search_environment_schema_1.featureSearchEnvironmentSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            overrideSchema: override_schema_1.overrideSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            variantSchema: variant_schema_1.variantSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=feature-search-response-schema.js.map