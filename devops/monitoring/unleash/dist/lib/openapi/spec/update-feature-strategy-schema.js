"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeatureStrategySchema = void 0;
const parameters_schema_1 = require("./parameters-schema");
const constraint_schema_1 = require("./constraint-schema");
exports.updateFeatureStrategySchema = {
    $id: '#/components/schemas/updateFeatureStrategySchema',
    type: 'object',
    description: 'Update a strategy configuration in a feature',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the strategy type',
        },
        sortOrder: {
            type: 'number',
            description: 'The order of the strategy in the list in feature environment configuration',
        },
        constraints: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
            description: 'A list of the constraints attached to the strategy. See https://docs.getunleash.io/reference/activation-strategies#constraints',
        },
        title: {
            type: 'string',
            nullable: true,
            description: 'A descriptive title for the strategy',
            example: 'Gradual Rollout 25-Prod',
        },
        disabled: {
            type: 'boolean',
            description: 'A toggle to disable the strategy. defaults to true. Disabled strategies are not evaluated or returned to the SDKs',
            example: false,
            nullable: true,
        },
        parameters: {
            $ref: '#/components/schemas/parametersSchema',
        },
    },
    components: {
        schemas: {
            constraintSchema: constraint_schema_1.constraintSchema,
            parametersSchema: parameters_schema_1.parametersSchema,
        },
    },
};
//# sourceMappingURL=update-feature-strategy-schema.js.map