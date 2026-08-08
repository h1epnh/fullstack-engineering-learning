"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontendApiFeaturesSchema = void 0;
const frontend_api_feature_schema_1 = require("./frontend-api-feature-schema");
exports.frontendApiFeaturesSchema = {
    $id: '#/components/schemas/frontendApiFeaturesSchema',
    type: 'object',
    required: ['toggles'],
    additionalProperties: false,
    description: 'Frontend SDK features list',
    properties: {
        toggles: {
            description: 'The actual features returned to the Frontend SDK',
            type: 'array',
            items: {
                $ref: frontend_api_feature_schema_1.frontendApiFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            frontendApiFeatureSchema: frontend_api_feature_schema_1.frontendApiFeatureSchema,
        },
    },
};
//# sourceMappingURL=frontend-api-features-schema.js.map