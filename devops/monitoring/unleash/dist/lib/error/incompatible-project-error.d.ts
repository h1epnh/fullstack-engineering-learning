import { type ApiErrorSchema, UnleashError } from './unleash-error';
export default class IncompatibleProjectError extends UnleashError {
    statusCode: number;
    constructor(targetProject: string);
    toJSON(): ApiErrorSchema;
}
//# sourceMappingURL=incompatible-project-error.d.ts.map