"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = exports.nameType = exports.customJoi = void 0;
const joi_1 = __importDefault(require("joi"));
const unleash_error_1 = require("../error/unleash-error");
const from_legacy_error_1 = require("../error/from-legacy-error");
const http_errors_1 = __importDefault(require("http-errors"));
exports.customJoi = joi_1.default.extend((j) => ({
    type: 'isUrlFriendly',
    base: j.string(),
    messages: {
        'isUrlFriendly.base': '{{#label}} must be URL friendly',
    },
    validate(value, helpers) {
        // Base validation regardless of the rules applied
        if (encodeURIComponent(value) !== value ||
            value === '..' ||
            value === '.') {
            // Generate an error, state and options need to be passed
            return { value, errors: helpers.error('isUrlFriendly.base') };
        }
        return undefined;
    },
}));
exports.nameType = exports.customJoi.isUrlFriendly().min(1).max(100).required();
const handleErrors = (res, logger, error) => {
    if (http_errors_1.default.isHttpError(error)) {
        return res
            .status(
        // @ts-expect-error - The error object here is not guaranteed to contain status
        error.status ?? 400)
            .json({ message: error.message });
    }
    const finalError = error instanceof unleash_error_1.UnleashError ? error : (0, from_legacy_error_1.fromLegacyError)(error);
    const format = (thing) => JSON.stringify(thing, null, 2);
    if (!(error instanceof unleash_error_1.UnleashError)) {
        logger.debug(`I encountered an error that wasn't an instance of the \`UnleashError\` type. The original error was: ${format(error)}. It was mapped to ${format(finalError.toJSON())}`);
    }
    if (finalError.statusCode === 500) {
        logger.error(`Server failed executing request: ${format(error)}`, error);
    }
    return res.status(finalError.statusCode).json(finalError).end();
};
exports.handleErrors = handleErrors;
//# sourceMappingURL=util.js.map