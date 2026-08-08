"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenPayload = void 0;
const flattenPayload = (payload = {}, parentKey = '') => Object.entries(payload).reduce((acc, [key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)) {
        // If it's an object, recurse and merge the results
        Object.assign(acc, (0, exports.flattenPayload)(value, newKey));
    }
    else if (Array.isArray(value)) {
        // If it's an array, map through it and handle objects and non-objects differently
        value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
                Object.assign(acc, (0, exports.flattenPayload)(item, `${newKey}[${index}]`));
            }
            else {
                acc[`${newKey}[${index}]`] = item;
            }
        });
    }
    else {
        acc[newKey] = value;
    }
    return acc;
}, {});
exports.flattenPayload = flattenPayload;
//# sourceMappingURL=flattenPayload.js.map