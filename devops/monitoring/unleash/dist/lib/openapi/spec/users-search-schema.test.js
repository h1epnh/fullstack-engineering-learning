"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
test('usersSchema', () => {
    const data = [{ id: 1 }];
    expect((0, validate_1.validateSchema)('#/components/schemas/usersSearchSchema', data)).toBeUndefined();
});
//# sourceMappingURL=users-search-schema.test.js.map