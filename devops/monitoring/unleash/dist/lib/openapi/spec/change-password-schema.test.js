"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('changePasswordSchema', () => {
    const data = {
        token: '',
        password: '',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/changePasswordSchema', data)).toBeUndefined();
});
test('changePasswordSchema empty', () => {
    expect((0, validate_1.validateSchema)('#/components/schemas/changePasswordSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=change-password-schema.test.js.map