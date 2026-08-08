"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('updateTagsSchema', () => {
    const data = {
        addedTags: [
            {
                type: 'simple',
                value: 'besttag',
            },
        ],
        removedTags: [
            {
                type: 'simple2',
                value: 'besttag2',
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/updateTagsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=update-tags-schema.test.js.map