"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idsSchema = void 0;
exports.idsSchema = {
    $id: '#/components/schemas/idsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Used for bulk deleting multiple ids',
    required: ['ids'],
    properties: {
        ids: {
            type: 'array',
            description: 'Ids, for instance userid',
            items: {
                type: 'number',
                minimum: 0,
            },
            example: [12, 212],
        },
    },
    components: {},
};
//# sourceMappingURL=ids-schema.js.map