"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkToggleFeaturesSchema = void 0;
exports.bulkToggleFeaturesSchema = {
    $id: '#/components/schemas/bulkToggleFeaturesSchema',
    type: 'object',
    required: ['features'],
    description: 'The feature list used for bulk toggle operations',
    properties: {
        features: {
            type: 'array',
            description: 'The features that we want to bulk toggle',
            items: {
                type: 'string',
                description: 'The feature name we want to toggle',
            },
            example: ['feature-a', 'feature-b'],
        },
    },
    components: {},
};
//# sourceMappingURL=bulk-toggle-features-schema.js.map