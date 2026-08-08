import { type ApiErrorSchema, UnleashError } from './unleash-error';
export default class PasswordUndefinedError extends UnleashError {
    statusCode: number;
    constructor();
    toJSON(): ApiErrorSchema;
}
//# sourceMappingURL=password-undefined.d.ts.map