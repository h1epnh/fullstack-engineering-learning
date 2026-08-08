import { UnleashError } from './unleash-error';
declare class ContentTypeError extends UnleashError {
    statusCode: number;
    constructor(acceptedContentTypes: [string, ...string[]], providedContentType?: string);
}
export default ContentTypeError;
//# sourceMappingURL=content-type-error.d.ts.map