"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('tagsBulkAddSchema', () => {
    const data = {
        features: ['my-feature'],
        tags: {
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
        },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/tagsBulkAddSchema', data)).toBeUndefined();
});
//# sourceMappingURL=tags-bulk-add-schema.test.js.map