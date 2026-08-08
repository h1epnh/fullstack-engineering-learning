"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFeaturesSchema = void 0;
const tag_schema_1 = require("./tag-schema");
const project_feature_schema_1 = require("./project-feature-schema");
const project_feature_environment_schema_1 = require("./project-feature-environment-schema");
exports.projectFeaturesSchema = {
    $id: '#/components/schemas/projectFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    description: 'A list of features in a project',
    deprecated: true,
    properties: {
        version: {
            type: 'integer',
            description: "The version of the feature's schema",
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectFeatureSchema',
            },
            description: 'A list of features',
        },
    },
    components: {
        schemas: {
            projectFeatureSchema: project_feature_schema_1.projectFeatureSchema,
            projectFeatureEnvironmentSchema: project_feature_environment_schema_1.projectFeatureEnvironmentSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=project-features-schema.js.map