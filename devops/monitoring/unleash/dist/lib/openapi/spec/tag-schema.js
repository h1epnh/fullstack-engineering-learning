"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagSchema = void 0;
const util_1 = require("../../util");
exports.tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    description: 'Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
            description: `The value of the tag.`,
            minLength: util_1.TAG_MIN_LENGTH,
            maxLength: util_1.TAG_MAX_LENGTH,
            example: 'a-tag-value',
        },
        type: {
            type: 'string',
            minLength: util_1.TAG_MIN_LENGTH,
            maxLength: util_1.TAG_MAX_LENGTH,
            description: 'The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag',
            example: 'simple',
        },
        color: {
            type: 'string',
            description: 'The hexadecimal color code for the tag type.',
            example: '#FFFFFF',
            pattern: '^#[0-9A-Fa-f]{6}$',
            nullable: true,
        },
    },
    components: {},
};
//# sourceMappingURL=tag-schema.js.map