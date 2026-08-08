"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLegalValues = exports.validateDate = exports.validateSemver = exports.validateString = exports.validateNumber = void 0;
const constraint_value_types_1 = require("../../schema/constraint-value-types");
const bad_data_error_1 = __importDefault(require("../../error/bad-data-error"));
const semver_1 = require("../semver");
const validateNumber = async (value) => {
    await constraint_value_types_1.constraintNumberTypeSchema.validateAsync(value);
};
exports.validateNumber = validateNumber;
const validateString = async (value) => {
    await constraint_value_types_1.constraintStringTypeSchema.validateAsync(value);
};
exports.validateString = validateString;
const validateSemver = (value) => {
    if (typeof value !== 'string') {
        throw new bad_data_error_1.default(`the provided value is not a string.`);
    }
    if (!(0, semver_1.parseStrictSemVer)(value)) {
        throw new bad_data_error_1.default(`the provided value is not a valid semver format. The value provided was: ${value}`);
    }
};
exports.validateSemver = validateSemver;
const validateDate = async (value) => {
    await constraint_value_types_1.constraintDateTypeSchema.validateAsync(value);
};
exports.validateDate = validateDate;
const validateLegalValues = (legalValues, match) => {
    const legalStrings = legalValues.map((legalValue) => {
        return legalValue.value;
    });
    if (Array.isArray(match)) {
        // Compare arrays to arrays
        const valid = match.every((value) => legalStrings.includes(value));
        if (!valid)
            throw new bad_data_error_1.default(`input values are not specified as a legal value on this context field`);
    }
    else {
        const valid = legalStrings.includes(match);
        if (!valid)
            throw new bad_data_error_1.default(`${match} is not specified as a legal value on this context field`);
    }
};
exports.validateLegalValues = validateLegalValues;
//# sourceMappingURL=constraint-types.js.map