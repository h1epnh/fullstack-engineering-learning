"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omitKeys = void 0;
// https://stackoverflow.com/questions/53966509/typescript-type-safe-omit-function
const omitKeys = (obj, ...keys) => {
    const ret = {};
    let key;
    for (key in obj) {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
};
exports.omitKeys = omitKeys;
//# sourceMappingURL=omit-keys.js.map