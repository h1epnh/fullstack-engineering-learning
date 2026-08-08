"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isDefined_1 = require("./isDefined");
test('isDefined', () => {
    expect((0, isDefined_1.isDefined)(null)).toEqual(false);
    expect((0, isDefined_1.isDefined)(undefined)).toEqual(false);
    expect((0, isDefined_1.isDefined)(0)).toEqual(true);
    expect((0, isDefined_1.isDefined)(false)).toEqual(true);
});
//# sourceMappingURL=isDefined.test.js.map