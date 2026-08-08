"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDuplicates = void 0;
const findDuplicates = (arr) => {
    const seen = new Set();
    const duplicates = new Set();
    for (const item of arr) {
        if (seen.has(item)) {
            duplicates.add(item);
        }
        else {
            seen.add(item);
        }
    }
    return [...duplicates];
};
exports.findDuplicates = findDuplicates;
//# sourceMappingURL=findDuplicates.js.map