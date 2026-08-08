"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTagTypeSchema = void 0;
exports.updateTagTypeSchema = {
    $id: '#/components/schemas/updateTagTypeSchema',
    type: 'object',
    description: 'The request body for updating a tag type.',
    properties: {
        description: {
            type: 'string',
            description: 'The description of the tag type.',
            example: 'A tag type for describing the color of a tag.',
        },
        icon: {
            type: 'string',
            description: 'The icon of the tag type.',
            example: 'not-really-used',
        },
        color: {
            type: 'string',
            description: 'The hexadecimal color code for the tag type.',
            example: '#FFFFFF',
            pattern: '^#[0-9A-Fa-f]{6}$',
        },
    },
    components: {},
};
//# sourceMappingURL=update-tag-type-schema.js.map