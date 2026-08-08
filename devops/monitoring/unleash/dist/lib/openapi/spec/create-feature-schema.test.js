"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('createFeatureSchema', () => {
    const data = {
        name: 'disable-comments',
        type: 'release',
        description: 'Controls disabling of the comments section in case of an incident',
        impressionData: false,
        tags: [
            { type: 'simple', value: 'tag' },
            { type: 'simple', value: 'mytag' },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/createFeatureSchema', data)).toBeUndefined();
});
test('createFeatureSchema without tags', () => {
    const data = {
        name: 'disable-comments',
        type: 'release',
        description: 'Controls disabling of the comments section in case of an incident',
        impressionData: false,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/createFeatureSchema', data)).toBeUndefined();
});
//# sourceMappingURL=create-feature-schema.test.js.map