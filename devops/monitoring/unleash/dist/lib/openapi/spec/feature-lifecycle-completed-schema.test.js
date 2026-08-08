"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureLifecycleCompletedSchema', () => {
    const data = {
        status: 'kept',
        statusValue: 'variant1',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureLifecycleCompletedSchema', data)).toBeUndefined();
});
test('featureLifecycleCompletedSchema without status', () => {
    const data = {
        status: 'kept',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureLifecycleCompletedSchema', data)).toBeUndefined();
});
//# sourceMappingURL=feature-lifecycle-completed-schema.test.js.map