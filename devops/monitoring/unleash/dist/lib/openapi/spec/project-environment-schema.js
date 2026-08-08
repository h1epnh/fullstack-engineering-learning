"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectEnvironmentSchema = void 0;
const create_feature_strategy_schema_1 = require("./create-feature-strategy-schema");
const create_strategy_variant_schema_1 = require("./create-strategy-variant-schema");
exports.projectEnvironmentSchema = {
    $id: '#/components/schemas/projectEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Add an environment to a project, optionally also sets if change requests are enabled for this environment on the project',
    required: ['environment'],
    properties: {
        environment: {
            type: 'string',
            description: 'The environment to add to the project',
            example: 'development',
        },
        changeRequestsEnabled: {
            type: 'boolean',
            description: 'Whether change requests should be enabled or for this environment on the project or not',
            example: true,
        },
        defaultStrategy: {
            $ref: '#/components/schemas/createFeatureStrategySchema',
            description: 'A default strategy to create for this environment on the project.',
        },
    },
    components: {
        schemas: {
            createFeatureStrategySchema: create_feature_strategy_schema_1.createFeatureStrategySchema,
            createStrategyVariantSchema: create_strategy_variant_schema_1.createStrategyVariantSchema,
        },
    },
};
//# sourceMappingURL=project-environment-schema.js.map