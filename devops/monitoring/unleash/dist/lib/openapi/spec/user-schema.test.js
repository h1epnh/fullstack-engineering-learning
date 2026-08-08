"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('userSchema', () => {
    const data = {
        isAPI: false,
        id: 1,
        username: 'admin',
        imageUrl: 'avatar',
        seenAt: '2022-06-27T12:19:15.838Z',
        loginAttempts: 0,
        createdAt: '2022-04-08T10:59:25.072Z',
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/userSchema', {})).not.toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/userSchema', data)).toBeUndefined();
});
//# sourceMappingURL=user-schema.test.js.map