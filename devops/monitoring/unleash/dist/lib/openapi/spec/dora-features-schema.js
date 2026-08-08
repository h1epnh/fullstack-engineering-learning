"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doraFeaturesSchema = void 0;
exports.doraFeaturesSchema = {
    $id: '#/components/schemas/doraFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'timeToProduction'],
    description: 'The representation of a dora time to production feature metric',
    properties: {
        name: {
            type: 'string',
            description: 'The name of a feature flag',
        },
        timeToProduction: {
            type: 'number',
            description: 'The average number of days it takes a feature flag to get into production',
        },
    },
    components: {},
};
//# sourceMappingURL=dora-features-schema.js.map