"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const omit_keys_1 = require("./omit-keys");
test('omitKeys', () => {
    expect((0, omit_keys_1.omitKeys)({ a: 1, b: 2, c: 3 }, 'a', 'b')).toEqual({
        c: 3,
    });
});
//# sourceMappingURL=omit-keys.test.js.map