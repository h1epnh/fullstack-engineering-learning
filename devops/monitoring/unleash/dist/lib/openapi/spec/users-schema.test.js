"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('usersSchema', () => {
    const data = {
        users: [{ id: 1 }],
        rootRoles: [{ id: 1, type: 'a', name: 'b' }],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/usersSchema', data)).toBeUndefined();
});
//# sourceMappingURL=users-schema.test.js.map