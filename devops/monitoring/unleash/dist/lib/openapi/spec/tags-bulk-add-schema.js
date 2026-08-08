"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsBulkAddSchema = void 0;
const update_tags_schema_1 = require("./update-tags-schema");
const tag_schema_1 = require("./tag-schema");
exports.tagsBulkAddSchema = {
    $id: '#/components/schemas/tagsBulkAddSchema',
    description: 'Represents tag changes to be applied to a list of features.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'tags'],
    properties: {
        features: {
            description: 'The list of features that will be affected by the tag changes.',
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
        },
        tags: {
            description: 'The tag changes to be applied to the features.',
            $ref: '#/components/schemas/updateTagsSchema',
        },
    },
    components: {
        schemas: {
            updateTagsSchema: update_tags_schema_1.updateTagsSchema,
            tagSchema: tag_schema_1.tagSchema,
        },
    },
};
//# sourceMappingURL=tags-bulk-add-schema.js.map