"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('tokenUserSchema', () => {
    const data = {
        id: 0,
        name: '',
        email: '',
        createdBy: '',
        token: '',
        role: {
            id: 0,
            description: '',
            name: '',
            type: '',
        },
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/tokenUserSchema', data)).toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/tokenUserSchema', {})).toMatchSnapshot();
});
//# sourceMappingURL=token-user-schema.test.js.map