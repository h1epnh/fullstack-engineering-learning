"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortOrderSchema = void 0;
exports.sortOrderSchema = {
    $id: '#/components/schemas/sortOrderSchema',
    type: 'object',
    description: 'A map of object IDs and their corresponding sort orders.',
    additionalProperties: {
        type: 'integer',
        description: 'Sort order for the object whose ID is the key used for this property.',
        example: 6,
    },
    components: {},
};
//# sourceMappingURL=sort-order-schema.js.map