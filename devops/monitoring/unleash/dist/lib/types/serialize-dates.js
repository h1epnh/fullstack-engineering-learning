"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDates = void 0;
// Convert Date objects to strings recursively.
const serializeDates = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(exports.serializeDates);
    }
    const entries = Object.entries(obj).map(([k, v]) => {
        if (v instanceof Date) {
            return [k, v.toJSON()];
        }
        else {
            return [k, (0, exports.serializeDates)(v)];
        }
    });
    return Object.fromEntries(entries);
};
exports.serializeDates = serializeDates;
//# sourceMappingURL=serialize-dates.js.map