"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapValues = void 0;
const mapValues = (object, fn) => {
    const entries = Object.entries(object).map(([key, value]) => [
        key,
        fn(value),
    ]);
    return Object.fromEntries(entries);
};
exports.mapValues = mapValues;
//# sourceMappingURL=map-values.js.map