"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('instanceAdminStatsSchema', () => {
    const data = {
        instanceId: '123',
        users: 0,
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/instanceAdminStatsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=instance-admin-stats-schema.test.js.map