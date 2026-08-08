"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsSchema = void 0;
const tag_schema_1 = require("./tag-schema");
exports.tagsSchema = {
    $id: '#/components/schemas/tagsSchema',
    description: 'A list of tags with a version number',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tags'],
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to model the tags.',
        },
        tags: {
            type: 'array',
            description: 'A list of tags.',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    components: {
        schemas: {
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=tags-schema.js.map