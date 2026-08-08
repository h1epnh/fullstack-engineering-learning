"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchSchema = void 0;
exports.patchSchema = {
    $id: '#/components/schemas/patchSchema',
    type: 'object',
    required: ['path', 'op'],
    description: 'A [JSON patch](https://www.rfc-editor.org/rfc/rfc6902) operation description',
    properties: {
        path: {
            type: 'string',
            description: 'The path to the property to operate on',
            example: '/type',
        },
        op: {
            type: 'string',
            enum: ['add', 'remove', 'replace', 'copy', 'move'],
            description: 'The kind of operation to perform',
            example: 'replace',
        },
        from: {
            type: 'string',
            description: 'The target to move or copy from, if performing one of those operations',
            example: '/type',
        },
        value: {
            description: 'The value to add or replace, if performing one of those operations',
            example: 'kill-switch',
        },
    },
    components: {},
};
//# sourceMappingURL=patch-schema.js.map