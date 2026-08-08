"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeCaseKeys = exports.snakeCase = void 0;
const snakeCase = (input) => {
    const result = [];
    const splitString = input.split('');
    for (let i = 0; i < splitString.length; i++) {
        const char = splitString[i];
        if (i !== 0 && char.toLocaleUpperCase() === char) {
            result.push('_', char.toLocaleLowerCase());
        }
        else {
            result.push(char.toLocaleLowerCase());
        }
    }
    return result.join('');
};
exports.snakeCase = snakeCase;
const snakeCaseKeys = (obj) => {
    const objResult = {};
    Object.keys(obj).forEach((key) => {
        const snakeCaseKey = (0, exports.snakeCase)(key);
        objResult[snakeCaseKey] = obj[key];
    });
    return objResult;
};
exports.snakeCaseKeys = snakeCaseKeys;
//# sourceMappingURL=snakeCase.js.map