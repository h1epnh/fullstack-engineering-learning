import type { ErrorObject } from 'ajv';
import type { ValidationError } from 'joi';
import { type ApiErrorSchema, UnleashError } from './unleash-error';
type ValidationErrorDescription = {
    message: string;
    path?: string;
};
declare class BadDataError extends UnleashError {
    statusCode: number;
    details: ValidationErrorDescription[];
    constructor(message: string, errors?: [ValidationErrorDescription, ...ValidationErrorDescription[]]);
    toJSON(): ApiErrorSchema;
}
export default BadDataError;
export declare const fromOpenApiValidationError: (data: object) => (validationError: ErrorObject) => ValidationErrorDescription;
export declare const fromOpenApiValidationErrors: (data: object, validationErrors: [ErrorObject, ...ErrorObject[]]) => BadDataError;
export declare const fromJoiError: (err: ValidationError) => BadDataError;
//# sourceMappingURL=bad-data-error.d.ts.map