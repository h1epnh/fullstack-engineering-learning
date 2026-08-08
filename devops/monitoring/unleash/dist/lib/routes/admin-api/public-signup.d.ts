import type { Response } from 'express';
import Controller from '../controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
import type { IAuthRequest } from '../unleash-types';
import { type PublicSignupTokenCreateSchema, type PublicSignupTokenSchema, type PublicSignupTokensSchema, type PublicSignupTokenUpdateSchema } from '../../openapi';
interface TokenParam {
    token: string;
}
export declare class PublicSignupController extends Controller {
    private publicSignupTokenService;
    private userService;
    private accessService;
    private openApiService;
    private logger;
    constructor(config: IUnleashConfig, { publicSignupTokenService, accessService, userService, openApiService, }: Pick<IUnleashServices, 'publicSignupTokenService' | 'accessService' | 'userService' | 'openApiService'>);
    getAllPublicSignupTokens(req: IAuthRequest, res: Response<PublicSignupTokensSchema>): Promise<void>;
    getPublicSignupToken(req: IAuthRequest<TokenParam>, res: Response<PublicSignupTokenSchema>): Promise<void>;
    createPublicSignupToken(req: IAuthRequest<void, void, PublicSignupTokenCreateSchema>, res: Response<PublicSignupTokenSchema>): Promise<void>;
    updatePublicSignupToken(req: IAuthRequest<TokenParam, void, PublicSignupTokenUpdateSchema>, res: Response): Promise<any>;
}
export {};
//# sourceMappingURL=public-signup.d.ts.map