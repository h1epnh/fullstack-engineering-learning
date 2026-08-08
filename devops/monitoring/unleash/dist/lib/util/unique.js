"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueByKey = exports.unique = void 0;
const unique = (items) => Array.from(new Set(items));
exports.unique = unique;
const uniqueByKey = (items, key) => [...new Map(items.map((item) => [item[key], item])).values()];
exports.uniqueByKey = uniqueByKey;
//# sourceMappingURL=unique.js.map