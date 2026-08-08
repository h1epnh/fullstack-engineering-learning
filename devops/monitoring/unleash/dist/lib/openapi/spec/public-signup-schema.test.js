"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('publicSignupTokenSchema', () => {
    const data = {
        name: 'Default',
        secret: 'some-secret',
        url: 'http://localhost:4242/invite-link/some-secret',
        expiresAt: new Date().toISOString(),
        users: [],
        role: { name: 'Viewer ', type: 'type', id: 1 },
        createdAt: new Date().toISOString(),
        createdBy: 'someone',
        enabled: true,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/publicSignupTokenSchema', {})).not.toBeUndefined();
    expect((0, validate_1.validateSchema)('#/components/schemas/publicSignupTokenSchema', data)).toBeUndefined();
});
//# sourceMappingURL=public-signup-schema.test.js.map