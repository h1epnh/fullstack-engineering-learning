"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTagTypeSchema = void 0;
const tag_type_schema_1 = require("./tag-type-schema");
exports.validateTagTypeSchema = {
    $id: '#/components/schemas/validateTagTypeSchema',
    type: 'object',
    required: ['valid', 'tagType'],
    description: 'The result of validating a tag type.',
    properties: {
        valid: {
            type: 'boolean',
            description: 'Whether or not the tag type is valid.',
            example: true,
        },
        tagType: {
            $ref: '#/components/schemas/tagTypeSchema',
        },
    },
    components: {
        schemas: {
            tagTypeSchema: tag_type_schema_1.tagTypeSchema,
        },
    },
};
//# sourceMappingURL=validate-tag-type-schema.js.map