import type { FromSchema } from 'json-schema-to-ts';
export declare const UnleashApiErrorTypes: readonly ["ContentTypeError", "DisabledError", "FeatureHasTagError", "IncompatibleProjectError", "InvalidOperationError", "InvalidTokenError", "NameExistsError", "NoAccessError", "NotFoundError", "NotImplementedError", "OperationDeniedError", "PasswordMismatch", "PasswordUndefinedError", "ProjectWithoutOwnerError", "RoleInUseError", "UnknownError", "UsedTokenError", "BadDataError", "ValidationError", "AuthenticationRequired", "UnauthorizedError", "PermissionError", "InvalidTokenError", "OwaspValidationError", "ForbiddenError", "ExceedsLimitError", "PasswordPreviouslyUsedError", "RateLimitError", "InternalError"];
export type UnleashApiErrorName = (typeof UnleashApiErrorTypes)[number];
export declare abstract class UnleashError extends Error {
    id: string;
    name: string;
    abstract statusCode: number;
    additionalParameters: object;
    constructor(message: string, name?: string);
    help(): string;
    toJSON(): ApiErrorSchema;
    toString(): string;
}
export declare class GenericUnleashError extends UnleashError {
    statusCode: number;
    constructor({ name, message, statusCode, }: {
        name: UnleashApiErrorName;
        message: string;
        statusCode: number;
    });
}
export declare const apiErrorSchema: {
    readonly $id: "#/components/schemas/apiError";
    readonly type: "object";
    readonly required: readonly ["id", "name", "message"];
    readonly description: "An Unleash API error. Contains information about what went wrong.";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly description: "The kind of error that occurred. Meant for machine consumption.";
            readonly example: "ValidationError";
        };
        readonly id: {
            readonly type: "string";
            readonly description: "A unique identifier for this error instance. Can be used to search logs etc.";
            readonly example: "0b84c7fd-5278-4087-832d-0b502c7929b3";
        };
        readonly message: {
            readonly type: "string";
            readonly description: "A human-readable explanation of what went wrong.";
            readonly example: "We couldn't find an addon provider with the name that you are trying to add ('bogus-addon')";
        };
    };
    readonly components: {};
};
export type ApiErrorSchema = FromSchema<typeof apiErrorSchema>;
//# sourceMappingURL=unleash-error.d.ts.map