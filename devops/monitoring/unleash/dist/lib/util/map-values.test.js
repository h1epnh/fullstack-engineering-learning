"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_values_1 = require("./map-values");
test('mapValues', () => {
    expect((0, map_values_1.mapValues)({
        a: 1,
        b: 2,
        c: 3,
    }, (x) => x + 1)).toEqual({
        a: 2,
        b: 3,
        c: 4,
    });
});
//# sourceMappingURL=map-values.test.js.map