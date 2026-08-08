import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { IAuthRequest } from '../../routes/unleash-types';
import { type ContextFieldSchema } from '../../openapi/spec/context-field-schema';
import type { ContextFieldsSchema } from '../../openapi/spec/context-fields-schema';
import type { NameSchema } from '../../openapi/spec/name-schema';
import { type ContextFieldStrategiesSchema } from '../../openapi/spec/context-field-strategies-schema';
import type { UpdateContextFieldSchema } from '../../openapi/spec/update-context-field-schema';
import type { CreateContextFieldSchema } from '../../openapi/spec/create-context-field-schema';
import type { LegalValueSchema } from '../../openapi';
interface ContextParam {
    contextField: string;
}
interface DeleteLegalValueParam extends ContextParam {
    legalValue: string;
}
export declare class ContextController extends Controller {
    private transactionalContextService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { transactionalContextService, openApiService, }: Pick<IUnleashServices, 'transactionalContextService' | 'openApiService'>);
    getContextFields(req: Request, res: Response<ContextFieldsSchema>): Promise<void>;
    getContextField(req: Request<ContextParam>, res: Response<ContextFieldSchema>): Promise<void>;
    createContextField(req: IAuthRequest<void, void, CreateContextFieldSchema>, res: Response<ContextFieldSchema>): Promise<void>;
    updateContextField(req: IAuthRequest<ContextParam, void, UpdateContextFieldSchema>, res: Response): Promise<void>;
    updateLegalValue(req: IAuthRequest<ContextParam, void, LegalValueSchema>, res: Response): Promise<void>;
    deleteLegalValue(req: IAuthRequest<DeleteLegalValueParam, void>, res: Response): Promise<void>;
    deleteContextField(req: IAuthRequest<ContextParam>, res: Response): Promise<void>;
    validate(req: Request<void, void, NameSchema>, res: Response): Promise<void>;
    getStrategiesByContextField(req: IAuthRequest<{
        contextField: string;
    }>, res: Response<ContextFieldStrategiesSchema>): Promise<void>;
}
export {};
//# sourceMappingURL=context.d.ts.map