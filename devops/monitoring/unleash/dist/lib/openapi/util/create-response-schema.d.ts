import type { OpenAPIV3 } from 'openapi-types';
export declare const createResponseSchemas: (description: string, content: {
    [media: string]: OpenAPIV3.MediaTypeObject;
}) => OpenAPIV3.ResponseObject;
export declare const schemaNamed: (schemaName: string) => OpenAPIV3.MediaTypeObject;
export declare const schemaTyped: (type: OpenAPIV3.NonArraySchemaObjectType) => OpenAPIV3.MediaTypeObject;
export declare const createResponseSchema: (schemaName: string) => OpenAPIV3.ResponseObject;
export declare const createCsvResponseSchema: (schemaName: string, example: string) => OpenAPIV3.ResponseObject;
export declare const resourceCreatedResponseSchema: (schemaName: string) => OpenAPIV3.ResponseObject;
//# sourceMappingURL=create-response-schema.d.ts.map