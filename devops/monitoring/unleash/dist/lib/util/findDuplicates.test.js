"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findDuplicates_1 = require("./findDuplicates");
test('should find single duplicates', () => {
    expect((0, findDuplicates_1.findDuplicates)([1, 2, 3, 4, 1])).toEqual([1]);
    expect((0, findDuplicates_1.findDuplicates)(['a', 'b', 'a', 'a'])).toEqual(['a']);
});
test('should return an empty array for unique elements', () => {
    expect((0, findDuplicates_1.findDuplicates)(['a', 'b', 'c', 'd'])).toEqual([]);
});
test('should handle arrays with all identical elements', () => {
    expect((0, findDuplicates_1.findDuplicates)([1, 1, 1, 1])).toEqual([1]);
});
test('should handle multiple duplicates', () => {
    expect((0, findDuplicates_1.findDuplicates)([1, 2, 2, 1])).toEqual(expect.arrayContaining([1, 2]));
});
test('should handle an empty array', () => {
    expect((0, findDuplicates_1.findDuplicates)([])).toEqual([]);
});
test('should handle arrays with boolean values', () => {
    expect((0, findDuplicates_1.findDuplicates)([true, true, false, false, true])).toEqual(expect.arrayContaining([true, false]));
});
//# sourceMappingURL=findDuplicates.test.js.map