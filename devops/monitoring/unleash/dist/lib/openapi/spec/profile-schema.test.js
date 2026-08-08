"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('profileSchema', () => {
    const data = {
        rootRole: {
            id: 1,
            type: 'root',
            name: 'Admin',
        },
        projects: ['default', 'secretproject'],
        subscriptions: ['productivity-report'],
        features: [
            { name: 'firstFeature', project: 'default' },
            { name: 'secondFeature', project: 'secretproject' },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/profileSchema', data)).toBeUndefined();
});
//# sourceMappingURL=profile-schema.test.js.map