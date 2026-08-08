"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureSearchEnvironmentSchema = void 0;
const constraint_schema_1 = require("./constraint-schema");
const parameters_schema_1 = require("./parameters-schema");
const feature_strategy_schema_1 = require("./feature-strategy-schema");
const variant_schema_1 = require("./variant-schema");
const strategy_variant_schema_1 = require("./strategy-variant-schema");
const feature_environment_schema_1 = require("./feature-environment-schema");
exports.featureSearchEnvironmentSchema = {
    $id: '#/components/schemas/featureSearchEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'enabled', 'type'],
    description: 'A detailed description of the feature environment',
    properties: {
        ...feature_environment_schema_1.featureEnvironmentSchema.properties,
        yes: {
            description: 'How many times the toggle evaluated to true in last hour bucket',
            type: 'integer',
            example: 974,
            minimum: 0,
        },
        no: {
            description: 'How many times the toggle evaluated to false in last hour bucket',
            type: 'integer',
            example: 50,
            minimum: 0,
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
            featureStrategySchema: feature_strategy_schema_1.featureStrategySchema,
            strategyVariantSchema: strategy_variant_schema_1.strategyVariantSchema,
            featureEnvironmentSchema: feature_environment_schema_1.featureEnvironmentSchema,
            variantSchema: variant_schema_1.variantSchema,
        },
    },
};
//# sourceMappingURL=feature-search-environment-schema.js.map