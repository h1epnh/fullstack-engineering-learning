"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('adminFeaturesQuerySchema empty', () => {
    const data = {};
    expect((0, validate_1.validateSchema)('#/components/schemas/adminFeaturesQuerySchema', data)).toBeUndefined();
});
test('adminFeatureQuerySchema all fields', () => {
    const data = {
        tag: ['simple:some-tag', 'simple:some-other-tag'],
        namePrefix: 'some-prefix',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/adminFeaturesQuerySchema', data)).toBeUndefined();
});
test('pattern validation should deny invalid tags', () => {
    const data = {
        tag: ['something', 'somethingelse'],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/adminFeaturesQuerySchema', data)).toBeDefined();
});
//# sourceMappingURL=admin-features-query-schema.test.js.map