import type { IUnleashConfig } from '../types';
import type { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema';
import type { ApiTokenService } from './api-token-service';
export default class EdgeService {
    private logger;
    private apiTokenService;
    private timer;
    constructor({ apiTokenService }: {
        apiTokenService: ApiTokenService;
    }, { getLogger, eventBus, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>);
    getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema>;
}
//# sourceMappingURL=edge-service.d.ts.map