"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthOverviewSchema = void 0;
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
const tag_schema_1 = require("./tag-schema");
exports.healthOverviewSchema = {
    $id: '#/components/schemas/healthOverviewSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'version',
        'name',
        'defaultStickiness',
        'mode',
        'members',
        'health',
        'environments',
        'features',
    ],
    description: `An overview of a project's stats and its health as described in the documentation on [technical debt](https://docs.getunleash.io/reference/technical-debt)`,
    properties: {
        version: {
            type: 'integer',
            description: 'The project overview version.',
            example: 1,
        },
        name: {
            type: 'string',
            description: `The project's name`,
            example: 'enterprisegrowth',
        },
        description: {
            type: 'string',
            nullable: true,
            description: `The project's description`,
            example: 'The project for all things enterprisegrowth',
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
        members: {
            type: 'integer',
            description: 'The number of users/members in the project.',
            example: 5,
            minimum: 0,
        },
        health: {
            type: 'integer',
            description: 'The overall [health rating](https://docs.getunleash.io/reference/technical-debt#project-status) of the project.',
            example: 95,
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectEnvironmentSchema',
            },
            description: 'An array containing the names of all the environments configured for the project.',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            description: 'An array containing an overview of all the features of the project and their individual status',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the project was last updated.',
            example: '2023-04-19T08:15:14.000Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the project was last updated.',
            example: '2023-04-19T08:15:14.000Z',
        },
        favorite: {
            type: 'boolean',
            description: 'Indicates if the project has been marked as a favorite by the current user requesting the project health overview.',
            example: true,
        },
        stats: {
            $ref: '#/components/schemas/projectStatsSchema',
            description: 'Project statistics',
        },
        featureNaming: {
            $ref: '#/components/schemas/createFeatureNamingPatternSchema',
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
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=health-overview-schema.js.map