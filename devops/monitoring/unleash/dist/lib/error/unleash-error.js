"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrorSchema = exports.GenericUnleashError = exports.UnleashError = exports.UnleashApiErrorTypes = void 0;
const uuid_1 = require("uuid");
exports.UnleashApiErrorTypes = [
    'ContentTypeError',
    'DisabledError',
    'FeatureHasTagError',
    'IncompatibleProjectError',
    'InvalidOperationError',
    'InvalidTokenError',
    'NameExistsError',
    'NoAccessError',
    'NotFoundError',
    'NotImplementedError',
    'OperationDeniedError',
    'PasswordMismatch',
    'PasswordUndefinedError',
    'ProjectWithoutOwnerError',
    'RoleInUseError',
    'UnknownError',
    'UsedTokenError',
    'BadDataError',
    'ValidationError',
    'AuthenticationRequired',
    'UnauthorizedError',
    'PermissionError',
    'InvalidTokenError',
    'OwaspValidationError',
    'ForbiddenError',
    'ExceedsLimitError',
    'PasswordPreviouslyUsedError',
    'RateLimitError',
    // server errors; not the end user's fault
    'InternalError',
];
class UnleashError extends Error {
    constructor(message, name) {
        super();
        this.id = (0, uuid_1.v4)();
        this.name = name || this.constructor.name;
        super.message = message;
    }
    help() {
        return `Get help for id ${this.id}`;
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            message: this.message,
            details: [{ message: this.message }],
        };
    }
    toString() {
        return `${this.name}: ${this.message}`;
    }
}
exports.UnleashError = UnleashError;
class GenericUnleashError extends UnleashError {
    constructor({ name, message, statusCode, }) {
        super(message, name);
        this.statusCode = statusCode;
    }
}
exports.GenericUnleashError = GenericUnleashError;
exports.apiErrorSchema = {
    $id: '#/components/schemas/apiError',
    type: 'object',
    required: ['id', 'name', 'message'],
    description: 'An Unleash API error. Contains information about what went wrong.',
    properties: {
        name: {
            type: 'string',
            description: 'The kind of error that occurred. Meant for machine consumption.',
            example: 'ValidationError',
        },
        id: {
            type: 'string',
            description: 'A unique identifier for this error instance. Can be used to search logs etc.',
            example: '0b84c7fd-5278-4087-832d-0b502c7929b3',
        },
        message: {
            type: 'string',
            description: 'A human-readable explanation of what went wrong.',
            example: "We couldn't find an addon provider with the name that you are trying to add ('bogus-addon')",
        },
    },
    components: {},
};
//# sourceMappingURL=unleash-error.js.map