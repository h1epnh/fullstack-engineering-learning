"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureDependenciesSchema = void 0;
const dependent_feature_schema_1 = require("./dependent-feature-schema");
exports.featureDependenciesSchema = {
    $id: '#/components/schemas/featureDependenciesSchema',
    type: 'object',
    description: 'Feature dependency connection between a child feature and its dependencies',
    required: ['feature', 'dependencies'],
    additionalProperties: false,
    properties: {
        feature: {
            type: 'string',
            description: 'The name of the child feature.',
            example: 'child_feature',
        },
        dependencies: {
            type: 'array',
            description: 'List of parent features for the child feature',
            items: {
                $ref: '#/components/schemas/dependentFeatureSchema',
            },
        },
    },
    components: {
        schemas: {
            dependentFeatureSchema: dependent_feature_schema_1.dependentFeatureSchema,
        },
    },
};
//# sourceMappingURL=feature-dependencies-schema.js.map