"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromLegacyError = void 0;
const bad_data_error_1 = require("./bad-data-error");
const joi_1 = require("joi");
const unleash_error_1 = require("./unleash-error");
const getStatusCode = (errorName) => {
    switch (errorName) {
        case 'ContentTypeError':
            return 415;
        case 'ValidationError':
            return 400;
        case 'BadDataError':
            return 400;
        case 'OwaspValidationError':
            return 400;
        case 'PasswordUndefinedError':
            return 400;
        case 'InvalidTokenError':
            return 401;
        case 'UsedTokenError':
            return 403;
        case 'InvalidOperationError':
            return 403;
        case 'IncompatibleProjectError':
            return 403;
        case 'OperationDeniedError':
            return 403;
        case 'NotFoundError':
            return 404;
        case 'NameExistsError':
            return 409;
        case 'FeatureHasTagError':
            return 409;
        case 'RoleInUseError':
            return 400;
        case 'ProjectWithoutOwnerError':
            return 409;
        case 'UnknownError':
            return 500;
        case 'InternalError':
            return 500;
        case 'PasswordMismatch':
            return 401;
        case 'UnauthorizedError':
            return 401;
        case 'DisabledError':
            return 422;
        case 'NotImplementedError':
            return 405;
        case 'NoAccessError':
            return 403;
        case 'AuthenticationRequired':
            return 401;
        case 'ForbiddenError':
            return 403;
        case 'PermissionError':
            return 403;
        case 'BadRequestError': //thrown by express; do not remove
            return 400;
        default:
            return 500;
    }
};
const fromLegacyError = (e) => {
    if (e instanceof unleash_error_1.UnleashError) {
        return e;
    }
    const name = unleash_error_1.UnleashApiErrorTypes.includes(e.name)
        ? e.name
        : 'UnknownError';
    const statusCode = getStatusCode(name);
    if (name === 'NoAccessError') {
        return new unleash_error_1.GenericUnleashError({
            name: 'NoAccessError',
            message: e.message,
            statusCode,
        });
    }
    if (e instanceof joi_1.ValidationError) {
        return (0, bad_data_error_1.fromJoiError)(e);
    }
    if (name === 'ValidationError' || name === 'BadDataError') {
        return new unleash_error_1.GenericUnleashError({
            name: 'BadDataError',
            message: e.message,
            statusCode,
        });
    }
    if (name === 'OwaspValidationError') {
        return new unleash_error_1.GenericUnleashError({
            name: 'OwaspValidationError',
            message: e.message,
            statusCode,
        });
    }
    if (name === 'AuthenticationRequired') {
        return new unleash_error_1.GenericUnleashError({
            name: 'AuthenticationRequired',
            message: `You must be authenticated to view this content. Please log in.`,
            statusCode,
        });
    }
    return new unleash_error_1.GenericUnleashError({
        name: name,
        message: e.message,
        statusCode,
    });
};
exports.fromLegacyError = fromLegacyError;
//# sourceMappingURL=from-legacy-error.js.map