"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const median_1 = require("./median");
test('calculateMedian with an odd number of elements', () => {
    expect((0, median_1.median)([1, 3, 5])).toBe(3);
});
test('calculateMedian with an even number of elements', () => {
    expect((0, median_1.median)([1, 2, 3, 4])).toBe(2.5);
});
test('calculateMedian with negative numbers', () => {
    expect((0, median_1.median)([-5, -1, -3, -2, -4])).toBe(-3);
});
test('calculateMedian with one element', () => {
    expect((0, median_1.median)([42])).toBe(42);
});
test('calculateMedian with an empty array', () => {
    expect((0, median_1.median)([])).toBe(Number.NaN);
});
//# sourceMappingURL=median.test.js.map