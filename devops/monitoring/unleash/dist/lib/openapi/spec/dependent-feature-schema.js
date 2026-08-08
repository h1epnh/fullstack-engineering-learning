"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependentFeatureSchema = void 0;
const create_dependent_feature_schema_1 = require("./create-dependent-feature-schema");
exports.dependentFeatureSchema = {
    $id: '#/components/schemas/dependentFeatureSchema',
    type: 'object',
    description: 'Feature dependency on a parent feature in read model',
    required: ['feature'],
    additionalProperties: false,
    properties: create_dependent_feature_schema_1.createDependentFeatureSchema.properties,
    components: {},
};
//# sourceMappingURL=dependent-feature-schema.js.map