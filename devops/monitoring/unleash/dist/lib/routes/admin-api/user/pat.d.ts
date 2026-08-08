import type { Response } from 'express';
import Controller from '../../controller';
import type { IUnleashConfig, IUnleashServices } from '../../../types';
import type { IAuthRequest } from '../../unleash-types';
import { type PatSchema } from '../../../openapi/spec/pat-schema';
import { type PatsSchema } from '../../../openapi/spec/pats-schema';
import { type CreatePatSchema } from '../../../openapi/spec/create-pat-schema';
export default class PatController extends Controller {
    private patService;
    private openApiService;
    private logger;
    private flagResolver;
    constructor(config: IUnleashConfig, { openApiService, patService, }: Pick<IUnleashServices, 'openApiService' | 'patService'>);
    createPat(req: IAuthRequest<unknown, unknown, CreatePatSchema>, res: Response<PatSchema>): Promise<void>;
    getPats(req: IAuthRequest, res: Response<PatsSchema>): Promise<void>;
    deletePat(req: IAuthRequest<{
        id: number;
    }>, res: Response): Promise<void>;
}
//# sourceMappingURL=pat.d.ts.map