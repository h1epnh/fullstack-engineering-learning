"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateObjectCombinations = exports.generateCombinations = exports.splitByComma = void 0;
const splitByComma = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (key === 'properties' && typeof value === 'object') {
            const nested = (0, exports.splitByComma)(value);
            return { ...acc, ...nested };
        }
        else if (typeof value === 'string') {
            return { ...acc, [key]: value.split(',') };
        }
        else {
            return { ...acc, [key]: [value] };
        }
    }, {});
};
exports.splitByComma = splitByComma;
const generateCombinations = (obj) => {
    const keys = Object.keys(obj);
    return keys.reduce((results, key) => results.flatMap((result) => obj[key].map((value) => ({ ...result, [key]: value }))), [{}]);
};
exports.generateCombinations = generateCombinations;
const generateObjectCombinations = (obj) => {
    const splitObj = (0, exports.splitByComma)(obj);
    return (0, exports.generateCombinations)(splitObj);
};
exports.generateObjectCombinations = generateObjectCombinations;
//# sourceMappingURL=generateObjectCombinations.js.map