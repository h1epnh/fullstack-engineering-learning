"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flattenPayload_1 = require("./flattenPayload");
describe('flattenPayload', () => {
    it('should flatten a payload', () => {
        const payload = {
            a: 1,
            b: {
                c: 2,
                d: [3, 4],
                e: {
                    f: 5,
                },
            },
        };
        expect((0, flattenPayload_1.flattenPayload)(payload)).toEqual({
            a: 1,
            'b.c': 2,
            'b.d[0]': 3,
            'b.d[1]': 4,
            'b.e.f': 5,
        });
    });
    it('should handle conflicting keys gracefully by prioritizing later keys', () => {
        const payload = {
            a: {
                b: 1,
            },
            'a.b': 2,
        };
        expect((0, flattenPayload_1.flattenPayload)(payload)).toEqual({
            'a.b': 2,
        });
    });
});
//# sourceMappingURL=flattenPayload.test.js.map