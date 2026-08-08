"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arraysHaveSameItems = void 0;
const arraysHaveSameItems = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) {
        return false;
    }
    return [...setA].every((itemA) => {
        return setB.has(itemA);
    });
};
exports.arraysHaveSameItems = arraysHaveSameItems;
//# sourceMappingURL=arraysHaveSameItems.js.map