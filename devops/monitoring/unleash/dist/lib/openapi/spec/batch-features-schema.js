"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchFeaturesSchema = void 0;
exports.batchFeaturesSchema = {
    $id: '#/components/schemas/batchFeaturesSchema',
    type: 'object',
    description: 'A list of feature flag names for batch operations',
    required: ['features'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'List of feature flag names',
            example: ['my-feature-4', 'my-feature-5', 'my-feature-6'],
        },
    },
    components: {
        schemas: {},
    },
};
//# sourceMappingURL=batch-features-schema.js.map