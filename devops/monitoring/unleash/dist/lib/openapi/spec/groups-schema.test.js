"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('groupsSchema', () => {
    const data = {
        groups: [
            {
                id: 1,
                name: 'Group',
                users: [
                    {
                        user: {
                            id: 3,
                        },
                    },
                ],
            },
        ],
    };
    expect((0, validate_1.validateSchema)('#/components/schemas/groupsSchema', data)).toBeUndefined();
});
//# sourceMappingURL=groups-schema.test.js.map