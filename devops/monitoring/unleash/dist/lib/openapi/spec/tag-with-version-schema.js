"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagWithVersionSchema = void 0;
const tag_schema_1 = require("./tag-schema");
exports.tagWithVersionSchema = {
    $id: '#/components/schemas/tagWithVersionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tag'],
    description: 'A tag with a version number representing the schema used to model the tag.',
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to model the tag.',
            example: 1,
        },
        tag: {
            $ref: '#/components/schemas/tagSchema',
        },
    },
    components: {
        schemas: { tagSchema: tag_schema_1.tagSchema },
    },
};
//# sourceMappingURL=tag-with-version-schema.js.map