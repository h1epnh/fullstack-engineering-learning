"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('emailSchema', () => {
    const data = {
        email: '',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/emailSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/emailSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=email-schema.test.js.map