"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFeatureSchema = void 0;
exports.validateFeatureSchema = {
    $id: '#/components/schemas/validateFeatureSchema',
    type: 'object',
    required: ['name'],
    description: "Data used to validate a feature flag's name.",
    properties: {
        name: {
            description: 'The feature name to validate.',
            type: 'string',
            example: 'my-feature-3',
        },
        projectId: {
            description: 'The id of the project that the feature flag will belong to. If the target project has a feature naming pattern defined, the name will be validated against that pattern.',
            nullable: true,
            type: 'string',
            example: 'project-y',
        },
    },
    components: {},
};
//# sourceMappingURL=validate-feature-schema.js.map