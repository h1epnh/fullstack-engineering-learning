"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagTypesSchema = void 0;
const tag_type_schema_1 = require("./tag-type-schema");
exports.tagTypesSchema = {
    $id: '#/components/schemas/tagTypesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tagTypes'],
    description: 'A list of tag types with a version number representing the schema used to model the tag types.',
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to model the tag types.',
            example: 1,
        },
        tagTypes: {
            type: 'array',
            description: 'The list of tag types.',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
    },
    components: {
        schemas: {
            tagTypeSchema: tag_type_schema_1.tagTypeSchema,
        },
    },
};
//# sourceMappingURL=tag-types-schema.js.map