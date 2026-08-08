import { type ApiErrorSchema, UnleashError } from './unleash-error';
declare class PatternError extends UnleashError {
    statusCode: number;
    details?: {
        message: string;
    }[];
    constructor(message: string, details?: string[]);
    toJSON(): ApiErrorSchema;
}
export default PatternError;
//# sourceMappingURL=pattern-error.d.ts.map