"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arraysHaveSameItems_1 = require("./arraysHaveSameItems");
test('arraysHaveSameItems', () => {
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([], [])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1], [1])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1], [1, 1])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 1], [1])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2], [1, 2])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2], [2, 1])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2], [2, 2, 1])).toEqual(true);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1], [])).toEqual(false);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1], [2])).toEqual(false);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2], [1, 3])).toEqual(false);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2], [1, 2, 3])).toEqual(false);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2, 3], [1, 2])).toEqual(false);
    expect((0, arraysHaveSameItems_1.arraysHaveSameItems)([1, 2, 3], [1, 2, 4])).toEqual(false);
});
//# sourceMappingURL=arraysHaveSameItems.test.js.map