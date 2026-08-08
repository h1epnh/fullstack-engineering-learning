"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagSchema = void 0;
const util_1 = require("../../util");
const tag_schema_1 = require("./tag-schema");
exports.createTagSchema = {
    ...tag_schema_1.tagSchema,
    $id: '#/components/schemas/createTagSchema',
    description: 'Data used to create a new [tag](https://docs.getunleash.io/reference/feature-toggles#tags)',
    properties: {
        ...tag_schema_1.tagSchema.properties,
        value: {
            type: 'string',
            pattern: `^\\s*\\S.{${util_1.TAG_MIN_LENGTH - 2},${util_1.TAG_MAX_LENGTH - 2}}\\S\\s*$`,
            description: `The value of the tag. The value must be between ${util_1.TAG_MIN_LENGTH} and ${util_1.TAG_MAX_LENGTH} characters long. Leading and trailing whitespace is ignored and will be trimmed before saving the tag value.`,
            example: 'a-tag-value',
        },
    },
    components: {},
};
//# sourceMappingURL=create-tag-schema.js.map