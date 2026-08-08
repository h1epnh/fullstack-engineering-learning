import type { Response } from 'express';
import Controller from '../controller';
import type { IUnleashConfig, IUnleashServices } from '../../types';
import type { RequestBody } from '../unleash-types';
import { type ValidatedEdgeTokensSchema } from '../../openapi/spec/validated-edge-tokens-schema';
import type { TokenStringListSchema } from '../../openapi';
export default class EdgeController extends Controller {
    private readonly logger;
    private edgeService;
    private openApiService;
    constructor(config: IUnleashConfig, { edgeService, openApiService, }: Pick<IUnleashServices, 'edgeService' | 'openApiService'>);
    getValidTokens(req: RequestBody<TokenStringListSchema>, res: Response<ValidatedEdgeTokensSchema>): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map