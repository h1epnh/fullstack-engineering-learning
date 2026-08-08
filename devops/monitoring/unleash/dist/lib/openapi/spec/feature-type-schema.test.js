"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('featureTypeSchema', () => {
    const data = {
        description: '',
        id: '',
        name: '',
        lifetimeDays: 0,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/featureTypeSchema', data)).toBeUndefined();
});
test('featureTypeSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/featureTypeSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=feature-type-schema.test.js.map