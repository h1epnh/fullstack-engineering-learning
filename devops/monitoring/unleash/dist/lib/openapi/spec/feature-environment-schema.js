"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureEnvironmentSchema = void 0;
const constraint_schema_1 = require("./constraint-schema");
const parameters_schema_1 = require("./parameters-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const variant_schema_1 = require("./variant-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
exports.featureEnvironmentSchema = {
    $id: '#/components/schemas/featureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled'],
    description: 'A detailed description of the feature environment',
    properties: {
        name: {
            type: 'string',
            example: 'my-dev-env',
            description: 'The name of the environment',
        },
        featureName: {
            type: 'string',
            example: 'disable-comments',
            description: 'The name of the feature',
        },
        environment: {
            type: 'string',
            example: 'development',
            description: 'The name of the environment',
        },
        type: {
            type: 'string',
            example: 'development',
            description: 'The type of the environment',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description: '`true` if the feature is enabled for the environment, otherwise `false`.',
        },
        sortOrder: {
            type: 'number',
            example: 3,
            description: 'The sort order of the feature environment in the feature environments list',
        },
        variantCount: {
            type: 'number',
            description: 'The number of defined variants',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureStrategySchema',
            },
            description: 'A list of activation strategies for the feature environment',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'A list of variants for the feature environment',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T16:21:39.975Z',
            description: 'The date when metrics where last collected for the feature environment',
        },
        hasStrategies: {
            type: 'boolean',
            description: 'Whether the feature has any strategies defined.',
        },
        hasEnabledStrategies: {
            type: 'boolean',
            description: 'Whether the feature has any enabled strategies defined.',
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            variantSchema: variant_schema_1.variantSchema,
        },
    },
};
//# sourceMappingURL=feature-environment-schema.js.map