"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminFeaturesQuerySchema = void 0;
exports.adminFeaturesQuerySchema = {
    $id: '#/components/schemas/adminFeaturesQuerySchema',
    type: 'object',
    additionalProperties: false,
    description: 'Query parameters used to modify the list of features returned.',
    properties: {
        tag: {
            type: 'array',
            items: {
                type: 'string',
                pattern: '\\w+:\\w+',
            },
            description: 'Used to filter by tags. For each entry, a TAGTYPE:TAGVALUE is expected',
            example: ['simple:mytag'],
        },
        namePrefix: {
            type: 'string',
            description: 'A case-insensitive prefix filter for the names of feature flags',
            example: 'demo.part1',
        },
    },
    components: {},
};
//# sourceMappingURL=admin-features-query-schema.js.map