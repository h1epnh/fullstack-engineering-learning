"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('meSchema', () => {
    const data = {
        user: { id: 1 },
        permissions: [{ permission: 'a' }],
        feedback: [{ userId: 1, feedbackId: 'a', neverShow: false }],
        splash: { a: true },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/meSchema', data)).toBeUndefined();
});
test('meSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/meSchema', {})).toMatchSnapshot();
});
test('meSchema missing permissions', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/meSchema', { user: { id: 1 } })).toMatchSnapshot();
});
test('meSchema missing splash', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/meSchema', {
        user: { id: 1 },
        permissions: [],
        feedback: [],
    })).toMatchSnapshot();
});
//# sourceMappingURL=me-schema.test.js.map