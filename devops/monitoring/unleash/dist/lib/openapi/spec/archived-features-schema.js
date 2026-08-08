"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archivedFeaturesSchema = void 0;
const archived_feature_schema_1 = require("./archived-feature-schema");
exports.archivedFeaturesSchema = {
    $id: '#/components/schemas/archivedFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    description: 'A list of archived features',
    properties: {
        version: {
            type: 'integer',
            description: "The version of the feature's schema",
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/archivedFeatureSchema',
            },
            description: 'A list of features',
        },
    },
    components: {
        schemas: {
            archivedFeatureSchema: archived_feature_schema_1.archivedFeatureSchema,
        },
    },
};
//# sourceMappingURL=archived-features-schema.js.map