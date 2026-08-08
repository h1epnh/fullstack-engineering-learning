"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('validatePasswordSchema', () => {
    const data = {
        password: '',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/validatePasswordSchema', data)).toBeUndefined();
});
test('validatePasswordSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/validatePasswordSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=validate-password-schema.test.js.map