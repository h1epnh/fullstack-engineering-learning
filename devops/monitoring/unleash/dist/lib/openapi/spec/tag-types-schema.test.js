"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('tagTypesSchema', () => {
    const data = {
        version: 1,
        tagTypes: [
            {
                name: 'simple',
                description: 'Used to simplify filtering of features',
                icon: '#',
                color: '#FF0000',
            },
            {
                name: 'hashtag',
                description: '',
                icon: null,
                color: null,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/tagTypesSchema', {})).not.toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/tagTypesSchema', data)).toBeUndefined();
});
//# sourceMappingURL=tag-types-schema.test.js.map