"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJsonString = void 0;
const validateJsonString = (value) => {
    // from https://stackoverflow.com/a/20392392
    try {
        const parsedStr = JSON.parse(value);
        if (parsedStr && typeof parsedStr === 'object') {
            return true;
        }
    }
    catch (err) { }
    // an error is considered a non valid json
    return false;
};
exports.validateJsonString = validateJsonString;
//# sourceMappingURL=validateJsonString.js.map