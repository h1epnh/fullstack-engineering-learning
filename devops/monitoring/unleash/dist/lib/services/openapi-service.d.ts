import type { Express, RequestHandler, Response } from 'express';
import type { IUnleashConfig } from '../types/option';
import { type JsonSchemaProps, type SchemaId } from '../openapi';
import type { ApiOperation } from '../openapi/util/api-operation';
export declare class OpenApiService {
    private readonly config;
    private readonly logger;
    private readonly api;
    private flagResolver;
    constructor(config: IUnleashConfig);
    validPath(op: ApiOperation): RequestHandler;
    useDocs(app: Express): void;
    docsPath(): string;
    registerCustomSchemas<T extends JsonSchemaProps>(schemas: Record<string, T>): void;
    respondWithValidation<T, S = SchemaId>(status: number, res: Response<T>, schema: S, data: T, headers?: {
        [header: string]: string;
    }): void;
}
//# sourceMappingURL=openapi-service.d.ts.map