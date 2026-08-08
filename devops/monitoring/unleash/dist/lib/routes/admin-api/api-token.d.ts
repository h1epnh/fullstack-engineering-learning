import type { Response } from 'express';
import Controller from '../controller';
import type { IAuthRequest } from '../unleash-types';
import type { IUnleashConfig } from '../../types/option';
import { ApiTokenType } from '../../types/models/api-token';
import type { IUnleashServices } from '../../types';
import { type ApiTokensSchema } from '../../openapi/spec/api-tokens-schema';
import { type ApiTokenSchema } from '../../openapi/spec/api-token-schema';
import type { UpdateApiTokenSchema } from '../../openapi/spec/update-api-token-schema';
interface TokenParam {
    token: string;
}
interface TokenNameParam {
    name: string;
}
export declare const tokenTypeToCreatePermission: (tokenType: ApiTokenType) => string;
export declare class ApiTokenController extends Controller {
    private apiTokenService;
    private accessService;
    private frontendApiService;
    private openApiService;
    private logger;
    private flagResolver;
    constructor(config: IUnleashConfig, { apiTokenService, accessService, frontendApiService, openApiService, }: Pick<IUnleashServices, 'apiTokenService' | 'accessService' | 'frontendApiService' | 'openApiService'>);
    getAllApiTokens(req: IAuthRequest, res: Response<ApiTokensSchema>): Promise<void>;
    getApiTokensByName(req: IAuthRequest<TokenNameParam>, res: Response<ApiTokensSchema>): Promise<void>;
    createApiToken(req: IAuthRequest, res: Response<ApiTokenSchema>): Promise<any>;
    updateApiToken(req: IAuthRequest<TokenParam, void, UpdateApiTokenSchema>, res: Response): Promise<any>;
    deleteApiToken(req: IAuthRequest<TokenParam>, res: Response): Promise<void>;
    private accessibleTokensByName;
    private accessibleTokens;
}
export {};
//# sourceMappingURL=api-token.d.ts.map