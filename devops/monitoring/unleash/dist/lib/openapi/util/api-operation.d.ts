import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags';
type DeprecatedOpenAPITag = 'client' | 'other' | 'auth' | 'admin';
export interface ApiOperation<Tag = OpenApiTag | DeprecatedOpenAPITag> extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}
export {};
//# sourceMappingURL=api-operation.d.ts.map