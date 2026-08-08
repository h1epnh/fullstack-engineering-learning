"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('usersGroupsBaseSchema', () => {
    const data = {
        users: [
            {
                id: 1,
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/usersGroupsBaseSchema', data)).toBeUndefined();
});
//# sourceMappingURL=users-groups-base-schema.test.js.map