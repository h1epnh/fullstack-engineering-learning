"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectOverviewSchema = void 0;
const parameters_schema_1 = require("./parameters-schema");
const variant_schema_1 = require("./variant-schema");
const override_schema_1 = require("./override-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const feature_schema_1 = require("./feature-schema");
const constraint_schema_1 = require("./constraint-schema");
const environment_schema_1 = require("./environment-schema");
const feature_environment_schema_1 = require("./feature-environment-schema");
const project_stats_schema_1 = require("./project-stats-schema");
const create_feature_strategy_schema_1 = require("./create-feature-strategy-schema");
const project_environment_schema_1 = require("./project-environment-schema");
const create_strategy_variant_schema_1 = require("./create-strategy-variant-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const create_feature_naming_pattern_schema_1 = require("./create-feature-naming-pattern-schema");
const feature_type_count_schema_1 = require("./feature-type-count-schema");
exports.projectOverviewSchema = {
    $id: '#/components/schemas/projectOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'name', 'onboardingStatus'],
    description: 'A high-level overview of a project. It contains information such as project statistics, the name of the project, what members and what features it contains, etc.',
    properties: {
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        version: {
            type: 'integer',
            example: 1,
            description: 'The schema version used to describe the project overview',
        },
        name: {
            type: 'string',
            example: 'dx-squad',
            description: 'The name of this project',
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'DX squad feature release',
            description: 'Additional information about the project',
        },
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            description: 'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected', 'private'],
            example: 'open',
            description: "The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.",
        },
        featureLimit: {
            type: 'number',
            nullable: true,
            example: 100,
            description: 'A limit on the number of features allowed in the project. Null if no limit.',
        },
        featureNaming: {
            $ref: '#/components/schemas/createFeatureNamingPatternSchema',
        },
        members: {
            type: 'number',
            example: 4,
            description: 'The number of members this project has',
        },
        health: {
            type: 'number',
            example: 50,
            description: "An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#project-status) on a scale from 0 to 100",
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectEnvironmentSchema',
            },
            example: [
                { environment: 'development' },
                {
                    environment: 'production',
                    defaultStrategy: {
                        name: 'flexibleRollout',
                        constraints: [],
                        parameters: {
                            rollout: '50',
                            stickiness: 'customAppName',
                            groupId: 'stickyFlag',
                        },
                    },
                },
            ],
            description: 'The environments that are enabled for this project',
        },
        featureTypeCounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeCountSchema',
            },
            description: 'The number of features of each type that are in this project',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was last updated.',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was archived.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-02-10T08:36:35.262Z',
            description: 'When the project was created.',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description: '`true` if the project was favorited, otherwise `false`.',
        },
        onboardingStatus: {
            type: 'object',
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['onboarding-started', 'onboarded'],
                            example: 'onboarding-started',
                        },
                    },
                    required: ['status'],
                    additionalProperties: false,
                },
                {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['first-flag-created'],
                            example: 'first-flag-created',
                        },
                        feature: {
                            type: 'string',
                            description: 'The name of the feature flag',
                            example: 'my-feature-flag',
                        },
                    },
                    required: ['status', 'feature'],
                    additionalProperties: false,
                },
            ],
            description: 'The current onboarding status of the project.',
        },
    },
    components: {
        schemas: {
            environmentSchema: environment_schema_1.environmentSchema,
            projectEnvironmentSchema: project_environment_schema_1.projectEnvironmentSchema,
            createFeatureStrategySchema: create_feature_strategy_schema_1.createFeatureStrategySchema,
            createStrategyVariantSchema: create_strategy_variant_schema_1.createStrategyVariantSchema,
            constraintSchema: constraint_schema_1.constraintSchema,
            featureSchema: feature_schema_1.featureSchema,
            featureEnvironmentSchema: feature_environment_schema_1.featureEnvironmentSchema,
            overrideSchema: override_schema_1.overrideSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            variantSchema: variant_schema_1.variantSchema,
            projectStatsSchema: project_stats_schema_1.projectStatsSchema,
            createFeatureNamingPatternSchema: create_feature_naming_pattern_schema_1.createFeatureNamingPatternSchema,
            featureTypeCountSchema: feature_type_count_schema_1.featureTypeCountSchema,
        },
    },
};
//# sourceMappingURL=project-overview-schema.js.map